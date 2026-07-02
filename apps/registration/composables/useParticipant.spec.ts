import { describe, expect, it, beforeEach } from 'vitest'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useParticipant', () => {
  beforeEach(() => mockFetch.mockReset())

  it('null POST returns unavailable state', async () => {
    mockFetch.mockResolvedValue(null)
    const { generateInviteToken, getInviteState } = await callComposable(() => useParticipant())
    const result = await generateInviteToken()
    expect(getInviteState(result)).toBe('unavailable')
  })

  it('non-null POST returns ready state', async () => {
    mockFetch.mockResolvedValue({
      id: 1,
      name: '',
      self: false,
      status: 'pending',
      token: 'invite-token',
    })
    const { generateInviteToken, hasInviteToken, isPendingParticipant } = await callComposable(() => useParticipant())
    const result = await generateInviteToken()
    expect(hasInviteToken(result)).toBe(true)
    expect(isPendingParticipant(result!)).toBe(true)
  })

  it('DELETE /participant/self returns success', async () => {
    mockFetch.mockResolvedValue({ success: true })
    const { leaveProject } = await callComposable(() => useParticipant())
    await expect(leaveProject()).resolves.toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/participant/self', expect.objectContaining({ method: 'DELETE' }))
  })
})
