// tslint:disable no-expression-statement
import projects, { getProjectNameAndVariation } from './projects'

/*
  Note: It's not immediately clear from these tests that projects()
  will make an API call which returns mocked results. The mocks are
  in src/__mocks__/got.ts
*/

describe('The Poeditor Projects wrapper', () => {
  it('should return a response object', async () => {
    const result = await projects()
    expect(result).toMatchSnapshot()
  })

  it('should let me filter by project name', async () => {
    const result = await projects({ name: 'app' })
    expect(result.length).toBe(4)
    expect(result).toMatchSnapshot()
  })

  it('should let me filter by project variation', async () => {
    const result = await projects({ variation: 'residential' })
    expect(result.length).toBe(2)
    expect(result).toMatchSnapshot()
  })

  it('should let me filter by project normative', async () => {
    const result = await projects({ normative: 'formal' })
    expect(result.length).toBe(2)
    expect(result).toMatchSnapshot()
  })

  it('should let me filter by project name and variation', async () => {
    const result = await projects({
      name: 'app',
      variation: 'residential',
    })

    expect(result.length).toBe(2)
    expect(result).toMatchSnapshot()
  })

  it('should let me filter by project name, variation, and normative', async () => {
    const result = await projects({
      name: 'app',
      normative: 'formal',
      variation: 'residential',
    })
    expect(result.length).toBe(1)
    expect(result).toMatchSnapshot()
  })

  it('should be able to parse name, variation, and default from POEditor project name', () => {
    expect(getProjectNameAndVariation('')).toEqual({
      isDefault: false,
      name: undefined,
      normative: undefined,
      variation: undefined,
    })

    expect(
      getProjectNameAndVariation('App - Residential - Informal (default)')
    ).toEqual({
      isDefault: true,
      name: 'app',
      normative: 'informal',
      variation: 'residential',
    })

    expect(getProjectNameAndVariation('App - Commercial - Formal')).toEqual({
      isDefault: false,
      name: 'app',
      normative: 'formal',
      variation: 'commercial',
    })

    expect(getProjectNameAndVariation('Cockpit')).toEqual({
      isDefault: false,
      name: 'cockpit',
      normative: undefined,
      variation: undefined,
    })
  })
})
