// tslint:disable:no-expression-statement
import * as MOCK_AWS from 'aws-sdk-mock' // tslint:disable-line no-implicit-dependencies
import handler from './handler'
import { get as getRequestFixture, mockContext } from './test/fixtures/requests'

const mockRequest = {
  ...getRequestFixture,
  // the path convention is: /{project}/{variation}/{normative}
  path: '/app/residential/formal',
}

MOCK_AWS.mock('S3', 'headObject', (params: any, callback: any) => {
  if (params.Key.includes('lock-already-exists')) {
    return callback(null, {})
  }

  return callback(new Error())
})

MOCK_AWS.mock('S3', 'putObject', (params: any, callback: any) => {
  if (params.Key.includes('cannot-create')) {
    return callback(new Error())
  }

  return callback(null, { Item: { foo: 'bar' } })
})

function handlerPromise(event: any, context = mockContext): Promise<any> {
  return new Promise((resolve, reject) =>
    handler(event, context, (error: any, result: any) => (error ? reject(error) : resolve(result)))
  )
}

describe('The handler', () => {
  it('should return an API Gateway-compatible object', async () => {
    const result = await handlerPromise(mockRequest)

    expect(result.statusCode).toBeTruthy()

    expect(result.body).toBeTruthy()
    expect(typeof result.body).toBe('string')

    expect(result.headers).toBeTruthy()
    expect(result.headers['content-type']).toBeTruthy()
  })

  it('should return 400 if name of project is missing in request path', async () => {
    const result = await handlerPromise({ ...mockRequest, path: '/' })

    expect(result.statusCode).toBe(400)
    expect(result.body).toMatch('name missing')
  })

  it('should return 400 if a lock already exists', async () => {
    const result = await handlerPromise({ ...mockRequest, path: '/lock-already-exists' })

    expect(result.statusCode).toBe(400)
    expect(result.body).toMatch('already running')
  })

  it('should return 400 if we cannot create a new lock', async () => {
    const result = await handlerPromise({ ...mockRequest, path: '/cannot-create' })

    expect(result.statusCode).toBe(400)
    expect(result.body).toMatch('Unable to gain a lock')
  })

  it('should return 400 if there are no matching projects', async () => {
    const result = await handlerPromise({ ...mockRequest, path: '/no-such-project' })

    expect(result.statusCode).toBe(400)
    expect(result.body).toMatch('no POEditor project matching')
  })
})
