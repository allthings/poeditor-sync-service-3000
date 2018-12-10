// tslint:disable no-expression-statement
import listProjectLanguageTerms from './terms'

/*
  Note: It's not immediately clear from these tests that listProjectLanguageTerms()
  will make an API call which returns mocked results. The mocks are
  in src/__mocks__/got.ts
*/

describe('The Poeditor Terms wrapper', () => {
  it('should return an object of term-keys and their content and reference translation object key-value', async () => {
    expect(await listProjectLanguageTerms(1234, 'de')).toEqual({
      'contracts.unit-type.caretaker-room': {
        content: 'Hauswartraum',
        reference: 'Caretaker Room',
      },
      'contracts.unit-type.carport': {
        content: 'Einstellplatz',
        reference: 'Carport',
      },
      'test.missing.translation': {
        content: '',
        reference: 'Test Missing Translation (reference)',
      },
    })
  })
})
