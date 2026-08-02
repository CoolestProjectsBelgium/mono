import { describe, expect, it, beforeEach } from 'vitest'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useProjectinfo', () => {
  beforeEach(() => mockFetch.mockReset())

  it('fetchProject maps flat API response to ProjectDto', async () => {
    mockFetch.mockResolvedValue({
      project_name: 'P',
      project_descr: '',
      project_type: '',
      project_lang: 'nl',
      is_owner: true,
    })
    const { fetchProject } = await callComposable(() => useProjectinfo())
    const project = await fetchProject()
    expect(mockFetch).toHaveBeenCalledWith('/projectinfo', expect.any(Object))
    expect(project?.own_project?.project_name).toBe('P')
    expect(project?.is_owner).toBe(true)
  })
})
