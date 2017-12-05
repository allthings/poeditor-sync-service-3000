import { InterfaceProject } from './poeditor/projects'

export interface InterfaceResolvedTranslations {
  readonly translations: ReadonlyArray<any>
  readonly missing: ReadonlyArray<string>
}

export default function resolveTranslationsGivenTermsAndDefaults(
  projects: ReadonlyArray<InterfaceProject>,
  languageCodes: ReadonlyArray<ReadonlyArray<string>>,
  terms: ReadonlyArray<ReadonlyArray<any>>
): InterfaceResolvedTranslations {
  // 1. find default projects
  const defaultProjectIndexes: { readonly [key: string]: number } = projects.reduce(
    (defaults, { isDefault, name }, projectIndex) =>
      isDefault ? { ...defaults, [name]: projectIndex } : defaults,
    {}
  )

  const translations = terms.map((project, projectIndex) => {
    const thisProject = projects[projectIndex]
    const defaultProjectIndex = defaultProjectIndexes[thisProject.name]

    return project.map((languageTerms, languageIndex) =>
      Object.keys(languageTerms).reduce((translatedTerms, term) => {
        const termTranslation = languageTerms[term]

        // the translation is OK
        if (termTranslation.length) {
          return { ...translatedTerms, [term]: termTranslation }
        }

        // the translation is missing, but there's a project-variation-default
        if (defaultProjectIndex) {
          const thisTermLanguageCode = languageCodes[projectIndex][languageIndex]
          const defaultProjectMatchingLanguageIndex = languageCodes[defaultProjectIndex].indexOf(
            thisTermLanguageCode
          )
          const defaultTermTranslation =
            defaultProjectMatchingLanguageIndex >= 0 &&
            terms[defaultProjectIndex][defaultProjectMatchingLanguageIndex][term]

          if (defaultTermTranslation.length) {
            return { ...translatedTerms, [term]: defaultTermTranslation }
          }
        }

        // the translation is missing, and there's no default; fallback to term's source language
        const fallbackProjectMatchingLanguageIndex = languageCodes[projectIndex].indexOf('en')
        const fallbackTermTranslation =
          fallbackProjectMatchingLanguageIndex >= 0 &&
          terms[projectIndex][fallbackProjectMatchingLanguageIndex][term]

        if (fallbackTermTranslation.length) {
          return { ...translatedTerms, [term]: fallbackTermTranslation }
        }

        // screwed. there are no translations for this term.
        return { ...translatedTerms, [term]: '' }
      }, {})
    )
  })

  /*
  missing.push({
    languageCode: languageCodes[projectIndex][languageIndex],
    project: thisProject,
    term,
  })
  */
  console.log('defaultProjectIndexes', defaultProjectIndexes, terms)
  console.log('translations', translations)

  return { translations, missing: [] }
}
