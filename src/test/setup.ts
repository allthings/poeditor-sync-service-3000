// tslint:disable:no-expression-statement
import * as AWS from 'aws-sdk'
import * as MOCK_AWS from 'aws-sdk-mock' // tslint:disable-line no-implicit-dependencies

process.env.DISABLE_KMS_DECRYPTION = 'true' // tslint:disable-line no-object-mutation

MOCK_AWS.setSDKInstance(AWS)

MOCK_AWS.mock('S3', 'deleteObjects', (params: any, callback: any) => {
  callback(null, { Item: { foo: 'bar' } })
})

MOCK_AWS.mock('KMS', 'decrypt', (params: any, callback: any) => {
  callback(null, params && params.CiphertextBlob && params.CiphertextBlob.toString())
})
