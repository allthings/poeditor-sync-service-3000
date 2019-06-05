export interface IInterfaceProjectMeta {
  readonly name: string | undefined
  readonly variation?: string | undefined
  readonly normative?: string | undefined
}

export default function getProjectMetaFromPath(
  path: string
): IInterfaceProjectMeta {
  const [, name, variation, normative] = path.match(
    /^\/([^/]+)\/*([^/]*)\/*([^/]*)\/*/
  ) || [undefined, undefined, undefined, undefined]
  const meta = { name, normative, variation }

  return Object.keys(meta).reduce(
    (reduced, key: keyof IInterfaceProjectMeta) => ({
      ...reduced,
      ...(meta[key] ? { [key]: meta[key] } : {}),
    }),
    { name }
  )
}
