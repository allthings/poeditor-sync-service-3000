// tslint:disable no-expression-statement
import resolveTranslationsGivenTermsAndDefaults from './translations'

describe('The translations', () => {
  it('should use default project terms when default project is given', async () => {
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
          variation: 'residential',
        },
      ],
      [['en', 'de'], ['en', 'de', 'fr']],
      [
        [{ 'foo.bar': 'yes yes foobar' }, { 'foo.bar': 'ja ja foobar' }],
        [{ 'foo.bar': 'yes yes foobar' }, { 'foo.bar': '' }, { 'foo.bar': '' }],
      ]
    )

    expect(translations[1]).toEqual([
      { 'foo.bar': 'yes yes foobar' },
      { 'foo.bar': 'ja ja foobar' },
      { 'foo.bar': 'yes yes foobar' },
    ])
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
      [[{ 'foo.bar': 'yes yes foobar' }, { 'foo.bar': '' }, { 'foo.bar': '' }]]
    )

    expect(translations[0]).toEqual([
      { 'foo.bar': 'yes yes foobar' },
      { 'foo.bar': 'yes yes foobar' },
      { 'foo.bar': 'yes yes foobar' },
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
      ],
      [['en', 'de', 'fr']],
      [[{ 'foo.bar': 'yes yes foobar' }, { 'foo.bar': '' }, { 'foo.bar': '' }]]
    )

    expect(missing.length).toBe(2)
  })
})
