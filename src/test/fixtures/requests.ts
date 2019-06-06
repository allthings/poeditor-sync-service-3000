export interface IInterfaceRequest extends AWSLambda.APIGatewayEvent {
  readonly body: any
  readonly cookies?: object
  readonly headers: any // lazy
  readonly hostname?: string | undefined
  readonly isBase64Encoded: boolean
  readonly timestamp?: number
  readonly context: AWSLambda.Context
}

export const mockContext: AWSLambda.Context = {
  awsRequestId: 'foobar',
  callbackWaitsForEmptyEventLoop: true,
  done: () => undefined,
  fail: () => undefined,
  functionName: 'foobar',
  functionVersion: 'foobar',
  getRemainingTimeInMillis: () => 0,
  invokedFunctionArn: 'foobar',
  logGroupName: 'foobar',
  logStreamName: 'foobar',
  memoryLimitInMB: 128,
  succeed: () => undefined,
}

export const mockRequestContext: AWSLambda.APIGatewayEventRequestContext = {
  accountId: 'foobar',
  apiId: 'foobar',
  httpMethod: 'GET',
  identity: {
    accessKey: null,
    accountId: null,
    apiKey: null,
    apiKeyId: null,
    caller: null,
    cognitoAuthenticationProvider: null,
    cognitoAuthenticationType: null,
    cognitoIdentityId: null,
    cognitoIdentityPoolId: null,
    sourceIp: 'foobar',
    user: null,
    userAgent: 'foobar',
    userArn: null,
  },
  path: '/',
  requestId: 'foobar',
  requestTimeEpoch: 1,
  resourceId: 'foobar',
  resourcePath: 'foobar',
  stage: 'foobar',
}

export const get: IInterfaceRequest = {
  body: 'foobar',
  context: mockContext,
  headers: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  path: '/',
  pathParameters: {},
  queryStringParameters: {},
  requestContext: mockRequestContext,
  resource: 'foobar',
  stageVariables: {},
}
