// tslint:disable no-expression-statement
import listProjectLanguageCodes from './languages'

/*
  Note: It's not immediately clear from these tests that listProjectLanguageCodes()
  will make an API call which returns mocked results. The mocks are
  in src/__mocks__/got.ts
*/

describe('The Poeditor Languages wrapper', () => {
  it('should return an array of language codes given a project ID', async () => {
    expect(await listProjectLanguageCodes(1234)).toEqual(['en', 'de'])
  })
})
