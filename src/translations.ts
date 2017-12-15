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
            missingTerms: reducedTermsMissing,
            processedTerms: reducedTerms,
          } = Object.keys(languageTerms).reduce(
            // This starts to get a bit nested/crazy and should probably be refactored
            // into it's own function for readability/clarity
            ({ missingTerms, processedTerms }: any, term) => {
              const termTranslation = languageTerms[term]

              // the term's translation is OK (non-empty)
              if (termTranslation.length) {
                return {
                  missingTerms,
                  processedTerms: {
                    ...processedTerms,
                    [term]: termTranslation,
                  },
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
                  ] &&
                  terms[defaultProjectIndex][
                    defaultProjectMatchingLanguageIndex
                  ][term]

                if (defaultTermTranslation && defaultTermTranslation.length) {
                  return {
                    missingTerms: [...missingTerms, term],
                    processedTerms: {
                      ...processedTerms,
                      [term]: defaultTermTranslation,
                    },
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
                  missingTerms: [...missingTerms, term],
                  processedTerms: {
                    ...processedTerms,
                    [term]: fallbackTermTranslation,
                  },
                }
              }

              // screwed. there are no translations for this term.
              return {
                missingTerms: [...missingTerms, term],
                processedTerms: {
                  ...processedTerms,
                  [term]: '',
                },
              }
            },
            // this is the .reduce()'s initial value
            { missingTerms: [], processedTerms: {} }
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
        // this is the .reduce()'s initial value
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
    // this is the .reduce()'s initial value
    { missing: [], translations: [] }
  )
}
