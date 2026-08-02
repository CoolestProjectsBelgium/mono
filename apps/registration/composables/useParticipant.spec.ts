import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

const notifyMock = vi.fn()
const writeTextMock = vi.fn()

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({ notify: notifyMock }),
}))

describe('useParticipant', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
    notifyMock.mockReset()
    writeTextMock.mockReset()
    writeTextMock.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    })
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
    })).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      '/projectinfo/participant/invite-token',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('removes registered participant via DELETE /projectinfo/participant/:token', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce(null)
    const { removeParticipant } = await callComposable(() => useParticipant())
    await expect(removeParticipant({
      id: 11,
      name: 'Sam',
      self: false,
      status: 'registered',
      token: 'voucher-guid',
    })).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith(
      '/projectinfo/participant/voucher-guid',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws when removing participant without token', async () => {
    const { removeParticipant } = await callComposable(() => useParticipant())
    await expect(removeParticipant({
      id: 11,
      name: 'Sam',
      self: false,
      status: 'registered',
    })).rejects.toThrow()
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

  it('copies raw invite token to clipboard', async () => {
    const { copyInviteToken } = await callComposable(() => useParticipant())
    await expect(copyInviteToken('invite-token')).resolves.toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('invite-token')
    expect(notifyMock).toHaveBeenCalledWith('success', 'participantCopyTokenSuccess')
  })

  it('notifies on clipboard failure when copying token', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('clipboard denied'))
    const { copyInviteToken } = await callComposable(() => useParticipant())
    await expect(copyInviteToken('invite-token')).resolves.toBe(false)
    expect(notifyMock).toHaveBeenCalledWith(
      'error',
      'error_An error occurred',
      undefined,
      expect.any(String),
    )
  })
})
