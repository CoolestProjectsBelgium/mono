import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useParticipant', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('creates invite via POST /projectinfo/participant', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce({ project_code: 'invite-token' })
    const { generateInviteToken, isPendingParticipant } = await callComposable(() => useParticipant())
    const result = await generateInviteToken()
    expect(mockFetch).toHaveBeenCalledWith('/projectinfo/participant', expect.objectContaining({ method: 'POST' }))
    expect(result?.token).toBe('invite-token')
    expect(isPendingParticipant(result!)).toBe(true)
  })

  it('removes pending invite via DELETE /projectinfo/participant/:token', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce(null)
    const { removeParticipant } = await callComposable(() => useParticipant())
    await expect(removeParticipant({
      id: 1,
      name: '',
      self: false,
      status: 'pending',
      token: 'invite-token',
    })).resolves.toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      '/projectinfo/participant/invite-token',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('leaves project via DELETE /participant/:id with project_code', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce(null)
    const { leaveProject } = await callComposable(() => useParticipant())
    await expect(leaveProject(9, 'voucher-guid')).resolves.toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/participant/9', expect.objectContaining({
      method: 'DELETE',
      body: { project_code: 'voucher-guid' },
    }))
  })
})
