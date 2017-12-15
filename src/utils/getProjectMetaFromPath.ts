export interface InterfaceProjectMeta {
  readonly name: string | undefined
  readonly variation?: string | undefined
  readonly normative?: string | undefined
}

export default function getProjectMetaFromPath(
  path: string
): InterfaceProjectMeta {
  const [, name, variation, normative] = path.match(
    /^\/([^/]+)\/*([^/]*)\/*([^/]*)\/*/
  ) || [undefined, undefined, undefined, undefined]
  const meta = { name, normative, variation }
  return Object.keys(meta).reduce(
    (reduced, key: keyof InterfaceProjectMeta) => ({
      ...reduced,
      ...meta[key] ? { [key]: meta[key] } : {},
    }),
    { name }
  )
}
