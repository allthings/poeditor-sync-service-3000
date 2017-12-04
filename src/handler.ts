import * as handler from 'alagarr'
// @TODO: aws-xray-sdk-core sucks. it's full of bloat.
import * as AwsXray from 'aws-xray-sdk-core'
import 'source-map-support/register'
import getPoeditorProjects from './poeditor/projects'
import { exists as s3ObjectExists, put as s3PutObject } from './utils/s3'

const { STAGE = 'development', CDN_HOST_URL = '' } = process.env
const IS_PRODUCTION = STAGE !== 'development'

const handlerConfig = {
  cspPolicies: {
    'default-src': "'self'",
  },
  enableCompression: IS_PRODUCTION,
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

/*
  4. 
  4. 
  5. 
  5.1 
  6. 
*/
export default handler(async (request: any, response: any) => {
  const { path } = request

  /*
    1. from request path, figure out which app & stage we should process.
  */
  const [, name, stage = ''] = path.match(/^\/([^/]+)\/*([^/]*)/) || [
    undefined,
    undefined,
    undefined,
  ]

  // Check that project name was included in request path
  if (!name) {
    // @TODO: just throw ClientError
    return response.json({ error: `Project name missing from request URL ${path}` }, 400)
  }

  /*
    2. Check if another synchronisation process is already running.
    Cheap lock implemented as an object in S3. In case of a crash,
    the S3 object will automatically expire after 300 seconds (5 minutes).
  */
  const lockObjectKey = `.locks/${name}${stage ? `-${stage}` : ''}`

  if (await s3ObjectExists(lockObjectKey)) {
    // @TODO: just throw ClientError
    return response.json(
      { error: `Synchronisation process for "${name}" is already running.` },
      400
    )
  } else {
    // No lock exists. Create one!
    if (!await s3PutObject(lockObjectKey, 'locked', { Expires: Date.now() + 300 })) {
      // @TODO: just throw ClientError
      return response.json(
        { error: `Unable to gain a lock on synchronisation process for "${name}".` },
        400
      )
    }
  }

  /*
    3. Get POEditor projects which match app name from step #1
  */
  const projects = await getPoeditorProjects(name)

  /*
    4. figure out each variation for each project (residential, commercial, formal, informal)
  */

  /*
    5. get all locales for each matched project-variations
  */

  /*
    6. get all translations for each locale for each project-variations
  */

  /*
    7. merge project defaults with variation (check for empty strings, too)
  */

  /*
    8. save dat shiiiit to s3.
  */

  return response.json({ message: 'Hi.', path, projects })
}, handlerConfig)
