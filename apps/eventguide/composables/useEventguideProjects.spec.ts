import { describe, expect, it } from 'vitest'
import { buildEventguideProjectsPath } from '~/composables/useEventguideProjects'

describe('buildEventguideProjectsPath', () => {
  it('uses the current-event endpoint by default', () => {
    expect(buildEventguideProjectsPath()).toBe('/eventguide/projects')
  })

  it('uses the explicit event endpoint when an id is provided', () => {
    expect(buildEventguideProjectsPath(3)).toBe('/eventguide/events/3/projects')
  })
})
