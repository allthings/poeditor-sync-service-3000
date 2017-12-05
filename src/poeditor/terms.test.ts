// tslint:disable no-expression-statement
import listProjectLanguageTerms from './terms'

describe('The Poeditor Terms wrapper', () => {
  it('should return an object of term-keys and their translation as key-value', async () => {
    expect(await listProjectLanguageTerms(1234, 'de')).toEqual({
      'contracts.unit-type.caretaker-room': 'Hauswartraum',
      'contracts.unit-type.carport': 'Einstellplatz',
      'test.missing.translation': '',
    })
  })
})
