import api from './api'

export interface InterfaceProject {
  readonly id: number
  readonly isDefault: boolean
  readonly name: string
  readonly variation: string | undefined
  readonly normative: string | undefined
}

export interface InterfaceProjectFilter {
  readonly name?: string
  readonly variation?: string
  readonly normative?: string
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
  const [
    ,
    name,
    ,
    /* above skipped index is 2nd regex group, used as delimiter */
    variation,
    normative,
    isDefault,
  ] = clean.match(
    /^([\w]+)([\W]*)([\w\s]*)(?:\2*)([\w\s]*?)([\s]*\(default\))*$/
  ) || [undefined, undefined, undefined, undefined, undefined, false]

  return {
    isDefault: !!isDefault,
    name: typeof name === 'string' && name.length ? name : undefined,
    normative:
      typeof normative === 'string' && normative.length ? normative : undefined,
    variation:
      typeof variation === 'string' && variation.length ? variation : undefined,
  }
}

// Wrapper for https://poeditor.com/docs/api#projects_list
export default async function listProjects(
  filters?: InterfaceProjectFilter
): Promise<ReadonlyArray<InterfaceProject>> {
  const response = await api('projects/list')

  const projects =
    response.result &&
    response.result.projects.map(({ id, name }: any) => ({
      id,
      ...getProjectNameAndVariation(name),
    }))

  if (filters) {
    return projects.filter((project: InterfaceProject) =>
      Object.keys(filters).reduce(
        (include: boolean, filter: keyof InterfaceProjectFilter) =>
          include && filters[filter] === project[filter],
        true
      )
    )
  }

  return projects
}
