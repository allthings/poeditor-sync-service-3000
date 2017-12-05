// tslint:disable no-expression-statement no-implicit-dependencies
import { throws } from 'smid'
import api from './api'

// Mock the http request
jest.mock('got', () => (apiMethodOrMockCode: string) =>
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
  )
)

beforeAll(() => {
  process.env.POEDITOR_TOKEN = 'foobar' // tslint:disable-line no-object-mutation
})

describe('The Poeditor API wrapper', () => {
  it('should return a response object', async () => {
    const response = await api('200')

    expect(response.result).toEqual({ foo: 'bar' })
  })

  it('should throw when status code is not 200', async () => {
    const error = await throws(api('400'))

    expect(error instanceof Error).toBe(true)
    expect(error.message).toMatch('mock message for code 400')
  })

  it('should throw when POEDITOR_TOKEN environment variable is unset', async () => {
    const error = await throws(api('200', {}, ''))

    expect(error instanceof Error).toBe(true)
    expect(error.message).toMatch('POEDITOR_TOKEN')
  })
})
