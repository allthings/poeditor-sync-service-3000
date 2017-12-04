// tslint:disable no-expression-statement
import listProjectLanguageCodes from './languages'

const mockResult = {
  response: { code: '200', message: 'OK', status: 'success' },
  result: {
    languages: [
      {
        code: 'en',
        name: 'English',
        percentage: 12.5,
        translations: 13,
        updated: '2015-05-04T14:21:41+0000',
      },
      {
        code: 'fr',
        name: 'French',
        percentage: 68.75,
        translations: 70,
        updated: '2015-04-30T08:59:34+0000',
      },
    ],
  },
}

// Mock the http request
jest.mock('got', () => () => new Promise(resolve => resolve({ body: mockResult })))

describe('The Poeditor Languages wrapper', () => {
  it('should return an array of language codes given a project ID', async () => {
    expect(await listProjectLanguageCodes(1234)).toEqual(['en', 'fr'])
  })
})
