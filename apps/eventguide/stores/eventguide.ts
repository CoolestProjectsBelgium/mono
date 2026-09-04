import { defineStore } from 'pinia'
import type { EventguideProjectsResponse } from '~/types/api'

type EventguideCacheKey = number | 'current'

export const useEventguideStore = defineStore('eventguide', {
  state: () => ({
    cacheKey: null as EventguideCacheKey | null,
    data: null as EventguideProjectsResponse | null,
  }),
  actions: {
    matches(cacheKey: EventguideCacheKey) {
      return this.cacheKey === cacheKey
    },
    setData(cacheKey: EventguideCacheKey, data: EventguideProjectsResponse) {
      this.cacheKey = cacheKey
      this.data = data
    },
    clear() {
      this.cacheKey = null
      this.data = null
    },
  },
})
