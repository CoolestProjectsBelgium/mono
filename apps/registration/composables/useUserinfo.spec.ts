import { describe, expect, it, beforeEach } from 'vitest'
import { userFixture } from '~/fixtures/user'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useUserinfo', () => {
  beforeEach(() => mockFetch.mockReset())

  it('null GET returns unavailable state', async () => {
    mockFetch.mockResolvedValue(null)
    const { fetchUser, getProfileState } = await callComposable(() => useUserinfo())
    const user = await fetchUser()
    expect(getProfileState(user)).toBe('unavailable')
  })

  it('non-null GET returns ready state', async () => {
    mockFetch.mockResolvedValue(userFixture)
    const { fetchUser, getProfileState, hasProfile } = await callComposable(() => useUserinfo())
    const user = await fetchUser()
    expect(getProfileState(user)).toBe('ready')
    expect(hasProfile(user)).toBe(true)
  })
})
