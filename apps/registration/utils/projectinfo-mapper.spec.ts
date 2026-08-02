import { describe, expect, it } from 'vitest'
import { mapApiProjectToView, mapOwnProjectToApi } from './projectinfo-mapper'

describe('projectinfo-mapper', () => {
  it('maps flat API project to ProjectDto wrapper', () => {
    const mapped = mapApiProjectToView({
      project_id: '1',
      project_name: 'Demo',
      project_descr: 'Desc',
      project_type: 'software',
      project_lang: 'nl',
      is_owner: true,
      participants: [],
    })

    expect(mapped?.own_project?.project_name).toBe('Demo')
    expect(mapped?.is_owner).toBe(true)
  })

  it('maps own project form to flat API body', () => {
    expect(mapOwnProjectToApi({
      project_name: 'Demo',
      project_descr: 'Desc',
      project_type: 'software',
      project_lang: 'nl',
    })).toEqual({
      project_name: 'Demo',
      project_descr: 'Desc',
      project_type: 'software',
      project_lang: 'nl',
    })
  })
})
