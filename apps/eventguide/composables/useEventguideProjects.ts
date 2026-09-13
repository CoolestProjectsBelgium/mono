import type { EventguideProject, EventguideProjectsResponse } from '~/types/api'
import { resolveApiBase, resolveEventguideAssetUrl } from '~/utils/api-base'

export function buildEventguideProjectsPath(eventId?: number): string {
  if (eventId != null) {
    return `/eventguide/events/${eventId}/projects`
  }
  return '/eventguide/projects'
}

export function normalizeEventguideProjectsResponse(
  data: EventguideProjectsResponse,
  apiBase: string,
): EventguideProjectsResponse {
  const projects = data.projects.map((project): EventguideProject => ({
    ...project,
    thumbnailUrl: resolveEventguideAssetUrl(project.thumbnailUrl, apiBase),
  }))

  return { ...data, projects }
}

export function useEventguideProjects(eventId?: number) {
  const config = useRuntimeConfig()
  const { apiFetch, apiBase } = useApiClient()
  const store = useEventguideStore()
  const cacheKey = eventId ?? 'current'
  const hasCache = store.matches(cacheKey) && store.data != null

  const pending = ref(!hasCache)
  const error = ref<string | null>(null)

  function resolvedApiBase(): string {
    return apiBase.value || resolveApiBase(config.public.apiBaseURL as string)
  }

  function withResolvedAssetUrls(
    data: EventguideProjectsResponse,
  ): EventguideProjectsResponse {
    return normalizeEventguideProjectsResponse(data, resolvedApiBase())
  }

  async function fetchProjects(force = false): Promise<EventguideProjectsResponse> {
    if (!force && store.matches(cacheKey) && store.data) {
      pending.value = false
      error.value = null
      return withResolvedAssetUrls(store.data)
    }

    pending.value = true
    error.value = null

    try {
      const response = await apiFetch<EventguideProjectsResponse>(
        buildEventguideProjectsPath(eventId),
      )
      const data = withResolvedAssetUrls(response)
      store.setData(cacheKey, data)
      return data
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load projects'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  return {
    pending: readonly(pending),
    error: readonly(error),
    data: computed(() => (
      store.matches(cacheKey) && store.data
        ? withResolvedAssetUrls(store.data)
        : null
    )),
    fetchProjects,
  }
}
