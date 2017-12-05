import mockLanguages from '../test/fixtures/poeditor/languages'
import mockProjects from '../test/fixtures/poeditor/projects'
import mockTerms from '../test/fixtures/poeditor/terms'

const responseMap: { readonly [key: string]: any } = {
  'https://api.poeditor.com/v2/languages/list': { body: mockLanguages },
  'https://api.poeditor.com/v2/projects/list': { body: mockProjects },
  'https://api.poeditor.com/v2/terms/list': { body: mockTerms },
}
// tslint:disable-next-line:no-expression-statement no-object-mutation
module.exports = async (url: string) => {
  return responseMap[url] || { body: {} }
}
