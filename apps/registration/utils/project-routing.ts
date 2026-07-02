import type { ProjectDto } from '~/types/api'
import { isEmptyApiResponse } from '~/utils/api-response'

export type ProjectRouteDecision = 'project' | 'no_project' | 'new_project'

export function resolveProjectRoute(project: ProjectDto | null): ProjectRouteDecision {
  if (isEmptyApiResponse(project)) {
    return 'no_project'
  }
  if (project.own_project || project.other_project) {
    return 'project'
  }
  return 'no_project'
}

export function hasProjectMembership(project: ProjectDto | null): boolean {
  return !isEmptyApiResponse(project) && !!(project.own_project || project.other_project)
}

/** True only for the project creator — not co-workers who joined via voucher. */
export function isProjectOwner(project: ProjectDto | null | undefined): boolean {
  return project?.is_owner === true
}

/** @deprecated Use hasProjectMembership or isProjectOwner */
export function hasOwnProject(project: ProjectDto | null): boolean {
  return hasProjectMembership(project)
}
