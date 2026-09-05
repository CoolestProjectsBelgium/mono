import { afterEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { buildEventguideProjectsPath, useEventguideProjects } from '~/composables/useEventguideProjects'
import { mockFetch } from '../tests/setup'
import type { EventguideProjectsResponse } from '~/types/api'

const sample: EventguideProjectsResponse = {
  event: {
    id: 1,
    title: 'Coolest Projects',
    officialStartDate: '2026-09-10T00:00:00.000Z',
    floorplanPath: 'eventguide/floorplans/map.svg',
    floorplanVersion: null,
  },
  projects: [],
}

describe('buildEventguideProjectsPath', () => {
  it('uses the current-event endpoint by default', () => {
    expect(buildEventguideProjectsPath()).toBe('/eventguide/projects')
  })

  it('uses the explicit event endpoint when an id is provided', () => {
    expect(buildEventguideProjectsPath(3)).toBe('/eventguide/events/3/projects')
  })
})

describe('useEventguideProjects', () => {
  afterEach(() => {
    mockFetch.mockReset()
  })

  it('does not stay pending when list and map both use the cached event', async () => {
    setActivePinia(createPinia())
    const store = useEventguideStore()
    store.setData('current', sample)

    const listPage = useEventguideProjects()
    expect(listPage.pending.value).toBe(false)
    expect(listPage.data.value).toEqual(sample)

    await listPage.fetchProjects()

    const mapPage = useEventguideProjects()
    expect(mapPage.pending.value).toBe(false)
    await mapPage.fetchProjects()
    expect(mapPage.pending.value).toBe(false)
    expect(mapPage.data.value).toEqual(sample)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
