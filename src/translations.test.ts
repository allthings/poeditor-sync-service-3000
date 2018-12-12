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
        {
          id: 3,
          isDefault: false,
          name: 'app',
          normative: 'formal',
          variation: 'commercial',
        },
      ],
      [['en', 'de', 'fr'], ['en', 'de', 'fr', 'pt'], ['en', 'de', 'it', 'pt']],
      [
        [
          { 'foo.bar': { content: 'default-variation en' } },
          { 'foo.bar': { content: 'default-variation de' } },
          { 'foo.bar': { content: '' } },
        ],
        [
          { 'foo.bar': { content: 'variation, fallback en' } },
          { 'foo.bar': { content: '' } },
          { 'foo.bar': { content: '' } },
          { 'foo.bar': { content: '' } },
        ],
        [
          { 'foo.bar': { content: 'variation, fallback en' } },
          { 'foo.bar': { content: '' } },
          { 'foo.bar': { content: 'variation, it' } },
          { 'foo.bar': { content: '' } },
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

    expect(translations[2]).toEqual([
      { 'foo.bar': 'variation, fallback en' },
      { 'foo.bar': 'default-variation de' },
      { 'foo.bar': 'variation, it' },
      { 'foo.bar': 'variation, fallback en' },
    ])

    expect(missing[2]).toEqual({
      id: 3,
      isDefault: false,
      name: 'app',
      normative: 'formal',
      variation: 'commercial',

      de: ['foo.bar'],
      pt: ['foo.bar'],
    })
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
          { 'foo.bar': { content: 'variation, fallback en' } },
          { 'foo.bar': { content: '' } },
          { 'foo.bar': { content: '' } },
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
          { 'foo.bar': { content: 'variation, fallback en' } },
          { 'foo.bar': { content: '' } },
          { 'foo.bar': { content: '' } },
        ],
        [{ 'foo.bar': { content: 'english' } }],
      ]
    )

    expect(missing.length).toBe(1)
    expect(missing[0].de.length).toBe(1)
    expect(missing[0].fr.length).toBe(1)
  })

  it('should be able to handle shitty data', async () => {
    const { translations, missing } = resolveTranslationsGivenTermsAndDefaults(
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
      [['en', '', 'fr'], ['en']],
      [[], [{ 'foo.bar': { content: '' } }]]
    )

    expect(translations.length).toBe(2)
    expect(translations[0].length).toBe(0)
    expect(missing.length).toBe(1)
  })

  it('should use reference if default project does not have fallback language translated', async () => {
    const { translations } = resolveTranslationsGivenTermsAndDefaults(
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
          variation: 'commercial',
        },
      ],
      [['de'], ['en']],
      [
        [
          {
            'foo.bar': {
              content: 'default-variation',
              reference: 'default-variont (reference)',
            },
          },
        ],
        [{ 'foo.bar': { content: '', reference: 'variation (reference)' } }],
      ]
    )
    expect(translations[1]).toEqual([{ 'foo.bar': 'variation (reference)' }])
  })

  it('should be able to handle scenario where default is missing terms present in a variation', async () => {
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
      [['en', '', 'fr'], ['en']],
      [[{}], [{ 'foo.bar': { content: '' } }]]
    )

    expect(translations.length).toBe(2)
    expect(translations[0].length).toBe(1)
    expect(missing.length).toBe(1)
  })
})
