// tslint:disable no-expression-statement
import projects, { getProjectNameAndVariation } from './projects'

const mockResult = {
  response: { code: '200', message: 'OK', status: 'success' },
  result: {
    projects: [
      {
        created: '2016-09-15T13:05:59+0000',
        id: 73515,
        name: 'App - Residential - Informal (default)',
        open: 0,
        public: 0,
      },
      { created: '2016-12-12T13:52:44+0000', id: 86419, name: 'Cockpit', open: 0, public: 0 },
      {
        created: '2017-10-05T13:48:30+0000',
        id: 136001,
        name: 'App - Commercial - Formal',
        open: 0,
        public: 0,
      },
      {
        created: '2017-10-05T13:56:18+0000',
        id: 136003,
        name: 'App - Commercial - Informal',
        open: 0,
        public: 0,
      },
      {
        created: '2017-10-05T13:56:31+0000',
        id: 136005,
        name: 'App - Residential - Formal',
        open: 0,
        public: 0,
      },
    ],
  },
}

// Mock the http request
jest.mock('got', () => ({
  default: () => {
    return new Promise(resolve => resolve({ body: mockResult }))
  },
}))

describe('The Poeditor Projects wrapper', () => {
  it('should return a response object', async () => {
    const result = await projects()
    expect(result).toMatchSnapshot()
  })

  it('should be able to parse name, variation, and default from POEditor project name', () => {
    expect(getProjectNameAndVariation('')).toEqual({
      isDefault: false,
      name: undefined,
      normative: undefined,
      variation: undefined,
    })

    expect(getProjectNameAndVariation('App - Residential - Informal (default)')).toEqual({
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
