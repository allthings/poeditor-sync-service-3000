// tslint:disable no-expression-statement
import listProjectLanguageTerms from './terms'

const mockResult = {
  response: { code: '200', message: 'OK', status: 'success' },
  result: {
    terms: [
      {
        comment: '',
        context: '',
        created: '2016-10-19T12:21:38+0000',
        plural: '',
        reference: 'Caretaker Room',
        tags: [],
        term: 'contracts.unit-type.caretaker-room',
        translation: {
          content: 'Hauswartraum',
          fuzzy: 0,
          updated: '2016-10-19T12:24:25+0000',
        },
        updated: '',
      },
      {
        comment: '',
        context: '',
        created: '2016-10-19T12:21:38+0000',
        plural: '',
        reference: 'Carport',
        tags: [],
        term: 'contracts.unit-type.carport',
        translation: {
          content: 'Einstellplatz',
          fuzzy: 0,
          updated: '2016-10-19T12:24:25+0000',
        },
        updated: '',
      },
    ],
  },
}

// Mock the http request
jest.mock('got', () => () => new Promise(resolve => resolve({ body: mockResult })))

describe('The Poeditor Terms wrapper', () => {
  it('should return an object of term-keys and their translation as key-value', async () => {
    expect(await listProjectLanguageTerms(1234, 'de')).toEqual({
      'contracts.unit-type.caretaker-room': 'Hauswartraum',
      'contracts.unit-type.carport': 'Einstellplatz',
    })
  })
})
