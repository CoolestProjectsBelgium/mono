import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEventguideStore } from '~/stores/eventguide'
import type { EventguideProjectsResponse } from '~/types/api'

const data: EventguideProjectsResponse = {
  event: {
    id: 4,
    title: 'Coolest Projects',
    officialStartDate: '2026-09-10T00:00:00.000Z',
    floorplanPath: 'eventguide/floorplans/map.svg',
    floorplanVersion: null,
  },
  projects: [],
}

describe('eventguide store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty and matches nothing', () => {
    const store = useEventguideStore()
    expect(store.data).toBeNull()
    expect(store.matches('current')).toBe(false)
    expect(store.matches(4)).toBe(false)
  })

  it('caches data under the key it was loaded for', () => {
    const store = useEventguideStore()
    store.setData(4, data)

    expect(store.data).toEqual(data)
    expect(store.matches(4)).toBe(true)
    // The "current event" view and an explicit event id are separate cache entries.
    expect(store.matches('current')).toBe(false)
    expect(store.matches(5)).toBe(false)
  })

  it('replaces the cached entry when another key is loaded', () => {
    const store = useEventguideStore()
    store.setData(4, data)
    store.setData('current', { ...data, projects: [] })

    expect(store.matches('current')).toBe(true)
    expect(store.matches(4)).toBe(false)
  })

  it('clear() drops both key and data', () => {
    const store = useEventguideStore()
    store.setData('current', data)
    store.clear()

    expect(store.data).toBeNull()
    expect(store.matches('current')).toBe(false)
  })
})
