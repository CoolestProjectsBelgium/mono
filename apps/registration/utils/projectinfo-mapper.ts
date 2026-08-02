import type { OwnProjectDto, ProjectDto } from '~/types/api'
import { hasApiData } from '~/utils/api-response'

export function mapApiProjectToView(api: OwnProjectDto | null | undefined): ProjectDto | null {
  if (!hasApiData(api)) {
    return null
  }

  return {
    is_owner: api.is_owner,
    own_project: {
      project_id: api.project_id,
      project_name: api.project_name,
      project_descr: api.project_descr,
      project_type: api.project_type,
      project_lang: api.project_lang,
      participants: api.participants,
      delete_possible: api.delete_possible,
    },
    attachments: api.attachments,
  }
}

export function mapOwnProjectToApi(project: OwnProjectDto): OwnProjectDto {
  return {
    project_id: project.project_id,
    project_name: project.project_name,
    project_descr: project.project_descr,
    project_type: project.project_type,
    project_lang: project.project_lang,
  }
}
