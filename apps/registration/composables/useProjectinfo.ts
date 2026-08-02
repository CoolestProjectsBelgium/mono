import type { OwnProjectDto, ProjectDto } from '~/types/api'
import { ApiError } from '~/composables/useApiClient'
import { hasApiData } from '~/utils/api-response'
import { mapApiProjectToView, mapOwnProjectToApi } from '~/utils/projectinfo-mapper'

export function useProjectinfo() {
  const { apiFetch } = useApiClient()

  async function fetchProject(): Promise<ProjectDto | null> {
    try {
      const response = await apiFetch<OwnProjectDto>('/projectinfo')
      return mapApiProjectToView(response)
    }
    catch {
      return null
    }
  }

  async function createProject(project: OwnProjectDto): Promise<ProjectDto | null> {
    const response = await apiFetch<OwnProjectDto>('/projectinfo', {
      method: 'POST',
      body: mapOwnProjectToApi(project),
    })
    return mapApiProjectToView(response)
  }

  async function updateProject(project: OwnProjectDto): Promise<ProjectDto | null> {
    const response = await apiFetch<OwnProjectDto>('/projectinfo', {
      method: 'PATCH',
      body: mapOwnProjectToApi(project),
    })
    const mapped = mapApiProjectToView(response)
    if (!mapped?.own_project) {
      throw new ApiError('Project update returned no data')
    }
    return mapped
  }

  async function deleteProject(): Promise<boolean> {
    await apiFetch<null>('/projectinfo', { method: 'DELETE' })
    return true
  }

  async function changeOwner(newOwnerId: number): Promise<void> {
    await apiFetch<null>(`/projectinfo/change-owner/${newOwnerId}`, {
      method: 'POST',
    })
  }

  function hasProject(project: ProjectDto | null): project is ProjectDto {
    return hasApiData(project) && !!project.own_project
  }

  return {
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    changeOwner,
    hasProject,
  }
}
