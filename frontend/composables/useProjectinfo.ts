import type { OwnProjectDto, ProjectDto } from '~/types/api'
import { hasApiData } from '~/utils/api-response'

export function useProjectinfo() {
  const { apiFetch } = useApiClient()

  async function fetchProject(): Promise<ProjectDto | null> {
    return apiFetch<ProjectDto>('/projectinfo')
  }

  async function createProject(project: OwnProjectDto): Promise<ProjectDto | null> {
    return apiFetch<ProjectDto>('/projectinfo', {
      method: 'POST',
      body: { own_project: project },
    })
  }

  async function updateProject(project: OwnProjectDto): Promise<ProjectDto | null> {
    return apiFetch<ProjectDto>('/projectinfo', {
      method: 'PATCH',
      body: { own_project: project },
    })
  }

  async function deleteProject(): Promise<boolean> {
    await apiFetch<null>('/projectinfo', { method: 'DELETE' })
    return true
  }

  function hasProject(project: ProjectDto | null): project is ProjectDto {
    return hasApiData(project) && !!(project.own_project || project.other_project)
  }

  return {
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    hasProject,
  }
}
