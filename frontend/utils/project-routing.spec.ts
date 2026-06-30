import { describe, expect, it } from 'vitest'
import { resolveProjectRoute } from '~/utils/project-routing'

describe('resolveProjectRoute', () => {
  it('redirects to no_project when null', () => {
    expect(resolveProjectRoute(null)).toBe('no_project')
  })

  it('routes to project when own_project exists', () => {
    expect(resolveProjectRoute({
      own_project: {
        project_name: 'Test',
        project_descr: '',
        project_type: '',
        project_lang: 'nl',
      },
    })).toBe('project')
  })

  it('routes to project when other_project exists', () => {
    expect(resolveProjectRoute({
      other_project: { project_code: 'TOKEN' },
    })).toBe('project')
  })
})
