import { describe, expect, it, beforeEach } from 'vitest'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useProjectinfo', () => {
  beforeEach(() => mockFetch.mockReset())

  it('fetchProject calls GET /projectinfo', async () => {
    mockFetch.mockResolvedValue({ own_project: { project_name: 'P', project_descr: '', project_type: '', project_lang: 'nl' } })
    const { fetchProject } = await callComposable(() => useProjectinfo())
    const project = await fetchProject()
    expect(mockFetch).toHaveBeenCalledWith('/projectinfo', expect.any(Object))
    expect(project?.own_project?.project_name).toBe('P')
  })
})
