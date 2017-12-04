import api from './api'

export interface InterfaceProject {
  readonly id: number
  readonly isDefault: boolean
  readonly name: string | undefined
  readonly variation: string | undefined
  readonly normative: string | undefined
}

export function getProjectNameAndVariation(
  projectName: string
): {
  readonly isDefault: boolean
  readonly name: string | undefined
  readonly variation: string | undefined
  readonly normative: string | undefined
} {
  const clean = projectName.toLowerCase() || ''
  const [, name, variation, normative, isDefault] = clean.match(
    /^([\w]+)[\W]*([\w]*)[\W]*([\w]*)[\W]*([\(\w\)]*)$/
  ) || [undefined, undefined, undefined, undefined, false]

  return {
    isDefault: !!isDefault,
    name: typeof name === 'string' && name.length ? name : undefined,
    normative: typeof normative === 'string' && normative.length ? normative : undefined,
    variation: typeof variation === 'string' && variation.length ? variation : undefined,
  }
}

export default async function listProjects(nameFilter: string): Promise<InterfaceProject> {
  const response = await api('projects/list')

  const projects =
    response.result &&
    response.result.projects.map(({ id, name }: any) => ({
      id,
      ...getProjectNameAndVariation(name),
    }))

  if (nameFilter) {
    return projects.filter(({ name }: InterfaceProject) => name === nameFilter)
  }

  return projects
}
