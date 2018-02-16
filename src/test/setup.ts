// tslint:disable:no-expression-statement
import * as AWS from 'aws-sdk'
import * as mockAWS from 'aws-sdk-mock' // tslint:disable-line no-implicit-dependencies

// fake base64 string
process.env.POEDITOR_TOKEN = 'foobar==' // tslint:disable-line no-object-mutation

mockAWS.setSDKInstance(AWS)

mockAWS.mock('S3', 'deleteObjects', (_: any, callback: any) =>
  callback(null, { Item: { foo: 'bar' } })
)

mockAWS.mock('KMS', 'decrypt', (params: any, callback: any) =>
  callback(
    null,
    params && params.CiphertextBlob && params.CiphertextBlob.toString()
  )
)
