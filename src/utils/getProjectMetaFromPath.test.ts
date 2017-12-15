// tslint:disable no-expression-statement
import getProjectMetaFromPath from './getProjectMetaFromPath'

describe('Project Meta', () => {
  it('should return empty object given invalid path', async () => {
    const expected = {}

    expect(getProjectMetaFromPath('')).toEqual(expected)
    expect(getProjectMetaFromPath('/')).toEqual(expected)
  })

  it('should return name given path /foobar', async () => {
    const expected = {
      name: 'foobar',
    }

    expect(getProjectMetaFromPath('/foobar')).toEqual(expected)
    expect(getProjectMetaFromPath('/foobar/')).toEqual(expected)
  })

  it('should return name and variation given path /foo/bar', async () => {
    const expected = {
      name: 'foo',
      variation: 'bar',
    }

    expect(getProjectMetaFromPath('/foo/bar')).toEqual(expected)
    expect(getProjectMetaFromPath('/foo/bar/')).toEqual(expected)
  })

  it('should return name, variation, and normative given path /foo/bar/foobar', async () => {
    const expected = {
      name: 'foo',
      normative: 'foobar',
      variation: 'bar',
    }

    expect(getProjectMetaFromPath('/foo/bar/foobar')).toEqual(expected)
    expect(getProjectMetaFromPath('/foo/bar/foobar/')).toEqual(expected)

    expect(getProjectMetaFromPath('/app/residential/formal')).toEqual({
      name: 'app',
      normative: 'formal',
      variation: 'residential',
    })
  })
})
