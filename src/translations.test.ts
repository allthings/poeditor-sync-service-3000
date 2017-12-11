// tslint:disable no-expression-statement
import resolveTranslationsGivenTermsAndDefaults from './translations'

describe('The translations', () => {
  it('should use default project terms when default project is given', async () => {
    const { translations, missing } = resolveTranslationsGivenTermsAndDefaults(
      [
        {
          id: 1,
          isDefault: true,
          name: 'app',
          normative: 'informal',
          variation: 'residential',
        },
        {
          id: 2,
          isDefault: false,
          name: 'app',
          normative: 'formal',
          variation: 'residential',
        },
      ],
      [['en', 'de', 'fr'], ['en', 'de', 'fr', 'pt']],
      [
        [
          { 'foo.bar': 'default-variation en' },
          { 'foo.bar': 'default-variation de' },
          { 'foo.bar': '' },
        ],
        [
          { 'foo.bar': 'variation, fallback en' },
          { 'foo.bar': '' },
          { 'foo.bar': '' },
          { 'foo.bar': '' },
        ],
      ]
    )

    /*
      Defaults/fallback chain:
      - default = variation where isDefault: true
      - fallback = current variation, english
    */
    expect(translations[1]).toEqual([
      { 'foo.bar': 'variation, fallback en' },
      { 'foo.bar': 'default-variation de' },
      { 'foo.bar': 'variation, fallback en' },
      { 'foo.bar': 'variation, fallback en' },
    ])

    expect(missing[1]).toEqual({
      id: 2,
      isDefault: false,
      name: 'app',
      normative: 'formal',
      variation: 'residential',

      de: ['foo.bar'],
      fr: ['foo.bar'],
      pt: ['foo.bar'],
    })
    expect(missing[0]).toEqual({
      id: 1,
      isDefault: true,
      name: 'app',
      normative: 'informal',
      variation: 'residential',

      fr: ['foo.bar'],
    })
  })

  it('should use fallback language terms when default project is not provided', async () => {
    const { translations } = resolveTranslationsGivenTermsAndDefaults(
      [
        {
          id: 1,
          isDefault: false,
          name: 'app',
          normative: 'informal',
          variation: 'residential',
        },
      ],
      [['en', 'de', 'fr']],
      [
        [
          { 'foo.bar': 'variation, fallback en' },
          { 'foo.bar': '' },
          { 'foo.bar': '' },
        ],
      ]
    )

    expect(translations[0]).toEqual([
      { 'foo.bar': 'variation, fallback en' },
      { 'foo.bar': 'variation, fallback en' },
      { 'foo.bar': 'variation, fallback en' },
    ])
  })

  it('should return a list of terms missing translations', async () => {
    const { missing } = resolveTranslationsGivenTermsAndDefaults(
      [
        {
          id: 1,
          isDefault: false,
          name: 'app',
          normative: 'informal',
          variation: 'residential',
        },
        {
          id: 2,
          isDefault: false,
          name: 'app',
          normative: 'formal',
          variation: 'residential',
        },
      ],
      [['en', 'de', 'fr'], ['en']],
      [
        [
          { 'foo.bar': 'variation, fallback en' },
          { 'foo.bar': '' },
          { 'foo.bar': '' },
        ],
        [{ 'foo.bar': 'english' }],
      ]
    )

    expect(missing.length).toBe(1)
    expect(missing[0].de.length).toBe(1)
    expect(missing[0].fr.length).toBe(1)
  })
})
