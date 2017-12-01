// tslint:disable no-expression-statement
import api from './api'

// Mock the http request
jest.mock('got', () => ({
  default: apiMethodOrMockCode =>
    new Promise(resolve =>
      resolve({
        body: {
          response: {
            code: apiMethodOrMockCode.substr(-3),
            message: `mock message for code ${apiMethodOrMockCode.substr(-3)}`,
          },
          result: { foo: 'bar' },
        },
      })
    ),
}))

describe('The Poeditor API wrapper', () => {
  it('should return a response object', async () => {
    const response = await api('200')

    expect(response.result).toEqual({ foo: 'bar' })
  })

  // @TODO: I cannot get this to work.
  /*it('should throw when status code is not 200', async () => {
    await expect(api('400')).rejects.toThrow()
  })*/
})
