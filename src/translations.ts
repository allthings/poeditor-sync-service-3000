import { InterfaceProject } from './poeditor/projects'

const SOURCE_LANGUAGE = process.env.SOURCE_LANGUAGE || 'en'

export interface InterfaceResolvedTranslations {
  readonly translations: ReadonlyArray<any>
  readonly missing: ReadonlyArray<any>
}

export default function resolveTranslationsGivenTermsAndDefaults(
  projects: ReadonlyArray<InterfaceProject>,
  languageCodes: ReadonlyArray<ReadonlyArray<string>>,
  terms: ReadonlyArray<ReadonlyArray<any>>
): InterfaceResolvedTranslations {
  // 1. find default projects
  const defaultProjectIndexes: {
    readonly [key: string]: number
  } = projects.reduce(
    (defaults, { isDefault, name }, projectIndex) =>
      isDefault ? { ...defaults, [name]: projectIndex } : defaults,
    {}
  )

  // 2. reduce the terms so that there are no empty translation values, if possible
  return terms.reduce(
    ({ translations, missing }: any, project, projectIndex) => {
      const thisProject = projects[projectIndex]
      const defaultProjectIndex = defaultProjectIndexes[thisProject.name]

      const {
        missing: missingProjectLanguageTerms,
        translatedProjectLanguages: reducedProject,
      } = project.reduce(
        (
          { missing: missingProjectTerms, translatedProjectLanguages }: any,
          languageTerms,
          languageIndex
        ) => {
          const thisLanguageCode = languageCodes[projectIndex][languageIndex]
          const {
            __missing: reducedTermsMissing,
            ...reducedTerms,
          } = Object.keys(languageTerms).reduce(
            ({ __missing: missingTerms, ...translatedTerms }: any, term) => {
              const termTranslation = languageTerms[term]

              // the term's translation is OK (non-empty)
              if (termTranslation.length) {
                return {
                  ...translatedTerms,
                  [term]: termTranslation,
                  __missing: missingTerms,
                }
              }

              // the term's translation is missing, but there's a project-variation-default
              if (typeof defaultProjectIndex !== 'undefined') {
                const defaultProjectMatchingLanguageIndex = languageCodes[
                  defaultProjectIndex
                ].indexOf(thisLanguageCode)
                const defaultTermTranslation =
                  defaultProjectMatchingLanguageIndex >= 0 &&
                  terms[defaultProjectIndex][
                    defaultProjectMatchingLanguageIndex
                  ][term]

                if (defaultTermTranslation.length) {
                  return {
                    ...translatedTerms,
                    [term]: defaultTermTranslation,
                    __missing: [...missingTerms, term],
                  }
                }
              }

              // the term's translation is missing, and there's no default;
              // fallback to term's source language
              const fallbackProjectMatchingLanguageIndex = languageCodes[
                projectIndex
              ].indexOf(SOURCE_LANGUAGE)
              const fallbackTermTranslation =
                fallbackProjectMatchingLanguageIndex >= 0 &&
                terms[projectIndex][fallbackProjectMatchingLanguageIndex][term]

              if (fallbackTermTranslation.length) {
                return {
                  ...translatedTerms,
                  [term]: fallbackTermTranslation,
                  __missing: [...missingTerms, term],
                }
              }

              // screwed. there are no translations for this term.
              return {
                ...translatedTerms,
                [term]: '',
                __missing: [...missingTerms, term],
              }
            },
            { __missing: [] }
          )

          return {
            missing: {
              ...missingProjectTerms,
              ...reducedTermsMissing && reducedTermsMissing.length
                ? { [thisLanguageCode]: reducedTermsMissing }
                : {},
            },
            translatedProjectLanguages: [
              ...translatedProjectLanguages,
              reducedTerms,
            ],
          }
        },
        { missing: {}, translatedProjectLanguages: [] }
      )
      return {
        missing: [
          ...missing,
          ...(missingProjectLanguageTerms &&
          Object.keys(missingProjectLanguageTerms).length
            ? [
                {
                  ...thisProject,
                  ...missingProjectLanguageTerms,
                },
              ]
            : []),
        ],
        translations: [...translations, reducedProject],
      }
    },
    { missing: [], translations: [] }
  )
}
