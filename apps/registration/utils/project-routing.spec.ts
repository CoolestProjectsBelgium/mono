import { describe, expect, it } from 'vitest'
import { isProjectOwner, resolveProjectRoute } from '~/utils/project-routing'

describe('isProjectOwner', () => {
  it('is true when top-level is_owner is true', () => {
    expect(isProjectOwner({
      is_owner: true,
      own_project: {
        project_name: 'P',
        project_descr: '',
        project_type: '',
        project_lang: 'nl',
      },
    })).toBe(true)
  })

  it('is false for co-workers', () => {
    expect(isProjectOwner({
      is_owner: false,
      own_project: {
        project_name: 'P',
        project_descr: '',
        project_type: '',
        project_lang: 'nl',
      },
    })).toBe(false)
  })

  it('is false when is_owner is missing', () => {
    expect(isProjectOwner({
      own_project: {
        project_name: 'P',
        project_descr: '',
        project_type: '',
        project_lang: 'nl',
        participants: [],
      },
    })).toBe(false)
  })
})

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
