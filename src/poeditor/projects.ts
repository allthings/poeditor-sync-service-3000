import api from './api'

export default async function listProjects(): any {
  const response = await api('projects/list')

  return response.result && response.result.projects
}
