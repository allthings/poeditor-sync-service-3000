// tslint:disable:no-expression-statement
import handler from './handler'
import { get as getRequestFixture, mockContext } from './test/fixtures/requests'

const mockRequest = {
  ...getRequestFixture,
  // the path convention is: /{project}/{stage}
  path: '/foobar/production',
}

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
  })
})
