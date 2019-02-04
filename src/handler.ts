import handler, {
  ClientError,
  InterfaceRequest,
  InterfaceResponse,
} from 'alagarr'
import * as AWSLambda from 'aws-lambda' // tslint:disable-line:no-implicit-dependencies
import * as AwsXray from 'aws-xray-sdk-core'
import 'source-map-support/register'
import getProjectLanguageCodes from './poeditor/languages'
import getPoeditorProjects from './poeditor/projects'
import getPoeditorProjectLanguageTerms from './poeditor/terms'
import resolveTranslationsGivenTermsAndDefaults from './translations'
import getProjectMetaFromPath from './utils/getProjectMetaFromPath'
import {
  exists as s3ObjectExists,
  put as s3PutObject,
  remove as s3RemoveObject,
} from './utils/s3'

const { STAGE } = process.env
const IS_PRODUCTION = STAGE !== 'development'

const handlerConfig = {
  cspPolicies: {
    'default-src': "'self'",
  },
  enableCompression: IS_PRODUCTION,
  // errorHandler: (_: any, response: any, error: any) => response.json(error),
  headers: {
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  },
}

/*
  Enable X-Ray in production
  See the results here:
  https://console.aws.amazon.com/xray/home#/service-map
*/
if (IS_PRODUCTION) {
  // tslint:disable:no-expression-statement no-var-requires
  AwsXray.captureHTTPsGlobal(require('http'))
  AwsXray.captureHTTPsGlobal(require('https'))
  // tslint:enable
}

export default handler(
  async (
    request: InterfaceRequest,
    response: InterfaceResponse,
    context: AWSLambda.Context
  ) => {
    const { path } = request

    /*
    1. from request path, figure out which app & stage we should process.
  */
    const { name, ...projectQuery } = getProjectMetaFromPath(path)

    // Check that project name was included in request path
    if (!name) {
      throw new ClientError(`Project name missing from request URL ${path}`)
    }

    /*
    2. Get POEditor projects which match application name from step #1
  */
    const projects = await getPoeditorProjects({ name, ...projectQuery })

    // Check that the variation exists
    if (Object.keys(projects).length === 0) {
      throw new ClientError(`There is no POEditor project matching ${path}`)
    }

    /*
    3. Check if another synchronisation process is already running.
    Cheap lock implemented as an object in S3. In case of a crash,
    the S3 object will automatically expire after 300 seconds (5 minutes).
  */
    const lockObjectKey = `${name}/${STAGE}/i18n/translation-sync.lock`

    if (await s3ObjectExists(lockObjectKey)) {
      throw new ClientError(
        `Synchronisation process for "${name}" is already running.`
      )
    }

    // No lock exists. Create one!
    const lockData = {
      date: Date.now(),
      name,
      ...projectQuery,
    }

    if (
      !(await s3PutObject(lockObjectKey, lockData, {
        Expires: new Date(
          Date.now() + context.getRemainingTimeInMillis()
        ).toISOString(),
      }))
    ) {
      throw new ClientError(
        `Unable to gain a lock for "${name}" synchronisation process.`
      )
    }

    /*
      Make sure that the lock file is cleaned up if we run out of
      synchronisation time (max 30 seconds).
      Unfortunately requires using a mutable variable as there's no other
      sensible way to indicate a timeout has occurred (that i can think of,
        and isn't a hack)
    */
    let hasTimedOut = false // tslint:disable-line
    const timeoutInterval: NodeJS.Timer = setInterval(async () => {
      if (Date.now() - (request.timestamp || 0) >= 60 * 1000) {
        context.callbackWaitsForEmptyEventLoop = false // tslint:disable-line
        hasTimedOut = true // tslint:disable-line

        return (
          !clearInterval(timeoutInterval) &&
          (await s3RemoveObject(lockObjectKey)) &&
          response.json(
            {
              error: 'SynchronisationTimeoutError',
              message:
                'Your request has run out of time, however the translation synchronisation process will continue in the background.',
            },
            408
          )
        )
      }
    }, 500)

    /*
    4. Get list of translation language codes for each project-variation
  */
    const listOfEachProjectsLanguageCodes = await Promise.all(
      projects.map(({ id }) => getProjectLanguageCodes(id))
    )

    // tslint:disable-next-line
    console.log('5', { listOfEachProjectsLanguageCodes })

    /*
    5. Get all translations for each language, for each project-variations
  */
    const termsForEachProjectLanguage = await Promise.all(
      projects.map((project, projectIndex) =>
        Promise.all(
          listOfEachProjectsLanguageCodes[projectIndex].map(languageCode =>
            getPoeditorProjectLanguageTerms(project.id, languageCode)
          )
        )
      )
    )

    /*
    6. Merge project defaults with variation (check for empty strings, too)
  */
    const {
      translations,
      missing,
    } = await resolveTranslationsGivenTermsAndDefaults(
      projects,
      await listOfEachProjectsLanguageCodes,
      await termsForEachProjectLanguage
    )

    /*
    7. Save dat shiiiit to s3.
  */
    // tslint:disable-next-line:no-expression-statement
    await Promise.all(
      projects.map(
        ({ name: projectName, variation, normative }, projectIndex) =>
          Promise.all(
            listOfEachProjectsLanguageCodes[projectIndex].map(
              (languageCode, languageIndex) =>
                s3PutObject(
                  `${projectName}/${STAGE}/i18n/${languageCode}/${
                    variation ? variation : 'default'
                  }${normative ? `-${normative}` : ''}.json`,
                  translations[projectIndex][languageIndex],
                  { ContentType: 'application/json' }
                )
            )
          )
      )
    )

    /*
    8. Delete the cheap-lock
  */
    // tslint:disable-next-line:no-expression-statement
    await s3RemoveObject(lockObjectKey)

    /*
    We're done!
  */
    return (
      !hasTimedOut &&
      !clearInterval(timeoutInterval) &&
      response.json({
        message: 'Translation synchronisation completed.',
        missing,
        path,
        projects,
      })
    )
  },
  handlerConfig
)
