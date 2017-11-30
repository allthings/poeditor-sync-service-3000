import handler from 'alagarr'
// @TODO: aws-xray-sdk-core sucks. it's full of bloat.
import * as AwsXray from 'aws-xray-sdk-core'
import 'source-map-support/register'
import kmsDecrypt from './utils/kms'

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

export default handler(async (request: any, response: any) => {
  const POEDITOR_TOKEN = await kmsDecrypt(process.env.POEDITOR_TOKEN || '') // result gets cached :-)
  const { body } = request

  return response.json({ message: 'Hi.', body })
}, handlerConfig)
