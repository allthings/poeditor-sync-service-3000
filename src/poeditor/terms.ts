import api from './api'

interface InterfacePoeditorTerm {
  readonly term: string
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

  return (
    response.result &&
    response.result.terms.reduce(
      (
        terms: any,
        { term, translation: { content } }: InterfacePoeditorTerm
      ) => ({
        ...terms,
        [term]: content,
      }),
      {}
    )
  )
}
