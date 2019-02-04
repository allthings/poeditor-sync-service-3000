import api from './api'

interface InterfacePoeditorTerm {
  readonly term: string
  readonly reference: string
  readonly translation: { readonly content: string }
}

// Wrapper for https://poeditor.com/docs/api#terms_list
export default async function listProjectLanguageTerms(
  projectId: number,
  languageCode: string
): Promise<any> {
  const response = await api('terms/list', {
    id: projectId,
    language: languageCode,
  })

  const reducedTerms =
    response.result &&
    response.result.terms.reduce(
      (
        terms: any,
        { reference, term, translation: { content } }: InterfacePoeditorTerm
      ) => ({
        ...terms,
        [term]: { content, reference },
      }),
      {}
    )

  return reducedTerms
}
