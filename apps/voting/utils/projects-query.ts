import type { FinishedResponse, ProjectsResponse } from '~/types/api'

export function buildProjectsQuery(
  languages: string[],
  skipProjectId?: number | null,
): Record<string, string> {
  const params: Record<string, string> = {
    languages: JSON.stringify(languages),
  }

  if (skipProjectId != null) {
    params.skipProject = JSON.stringify(skipProjectId)
  }

  return params
}

export function isFinishedResponse(data: ProjectsResponse): data is FinishedResponse {
  return 'message' in data && data.message === 'finished'
}
