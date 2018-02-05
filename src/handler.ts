import handler, { ClientError } from 'alagarr'
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

export default handler(async (request: any, response: any) => {
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
    !await s3PutObject(lockObjectKey, lockData, {
      Expires: new Date(Date.now() + 300 * 1000).toISOString(),
    })
  ) {
    throw new ClientError(
      `Unable to gain a lock for "${name}" synchronisation process.`
    )
  }

  /*
    4. Get list of translation language codes for each project-variation
  */
  const listOfEachProjectsLanguageCodes = await Promise.all(
    projects.map(({ id }) => getProjectLanguageCodes(id))
  )

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
  const { translations, missing } = resolveTranslationsGivenTermsAndDefaults(
    projects,
    listOfEachProjectsLanguageCodes,
    termsForEachProjectLanguage
  )

  /*
    7. Save dat shiiiit to s3.
  */
  // tslint:disable-next-line:no-expression-statement
  await Promise.all(
    projects.map(({ name: projectName, variation, normative }, projectIndex) =>
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
  return response.json({
    message: 'Translation synchronisation completed.',
    missing,
    path,
    projects,
  })
}, handlerConfig)
