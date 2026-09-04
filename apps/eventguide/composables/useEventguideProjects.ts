import type { EventguideProjectsResponse } from '~/types/api'

export function buildEventguideProjectsPath(eventId?: number): string {
  if (eventId != null) {
    return `/eventguide/events/${eventId}/projects`
  }
  return '/eventguide/projects'
}

export function useEventguideProjects(eventId?: number) {
  const { apiFetch } = useApiClient()
  const store = useEventguideStore()

  const pending = ref(true)
  const error = ref<string | null>(null)

  async function fetchProjects(force = false): Promise<EventguideProjectsResponse> {
    const cacheKey = eventId ?? 'current'
    if (!force && store.matches(cacheKey) && store.data) {
      return store.data
    }

    pending.value = true
    error.value = null

    try {
      const data = await apiFetch<EventguideProjectsResponse>(
        buildEventguideProjectsPath(eventId),
      )
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
    data: computed(() => store.data),
    fetchProjects,
  }
}
