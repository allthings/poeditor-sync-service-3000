// tslint:disable no-expression-statement
import listProjectLanguageCodes from './languages'

describe('The Poeditor Languages wrapper', () => {
  it('should return an array of language codes given a project ID', async () => {
    expect(await listProjectLanguageCodes(1234)).toEqual(['en', 'de'])
  })
})
