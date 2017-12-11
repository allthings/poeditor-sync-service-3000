import api from './api'

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
        {
          term,
          translation: { content },
        }: {
          readonly term: string
          readonly translation: { readonly content: string }
        }
      ) => ({ ...terms, [term]: content }),
      {}
    )
  )
}
