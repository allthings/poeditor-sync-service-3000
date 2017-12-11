import api from './api'

export default async function listProjectLanguageCodes(
  projectId: number
): Promise<ReadonlyArray<string>> {
  const response = await api('languages/list', { id: projectId })
  return (
    response.result &&
    response.result.languages.map(({ code }: { readonly code: string }) => code)
  )
}
