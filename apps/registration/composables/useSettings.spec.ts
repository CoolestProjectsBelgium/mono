import { describe, expect, it, beforeEach } from 'vitest'
import { activeSettingsFixture } from '~/fixtures/settings'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useSettings fetchSettings', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('calls /settings with Accept-Language header', async () => {
    mockFetch.mockResolvedValue(activeSettingsFixture)
    const { fetchSettings } = await callComposable(() => useSettings())
    const result = await fetchSettings()
    expect(mockFetch).toHaveBeenCalledWith('/settings', expect.objectContaining({
      baseURL: '/_api',
      credentials: 'include',
      headers: expect.objectContaining({ 'Accept-Language': expect.any(String) }),
    }))
    expect(result?.eventTitle).toBe('Coolest Projects 2026')
  })
})
