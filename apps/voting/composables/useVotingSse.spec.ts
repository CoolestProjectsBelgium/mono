import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyVotingSseEvent } from '~/utils/voting-sse-client'
import { useVotingSessionStore } from '~/stores/votingSession'

describe('applyVotingSseEvent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates the voting window on timer events', () => {
    const store = useVotingSessionStore()

    applyVotingSseEvent({
      type: 'timer',
      message: '',
      startDate: '2026-09-03T10:00:00.000Z',
      endDate: '2026-09-03T12:00:00.000Z',
    })

    expect(store.votingStartDate).toBe('2026-09-03T10:00:00.000Z')
    expect(store.votingEndDate).toBe('2026-09-03T12:00:00.000Z')
  })

  it('stores broadcast messages', () => {
    const store = useVotingSessionStore()

    applyVotingSseEvent({
      type: 'message',
      message: 'Voting will close soon.',
    })

    expect(store.visibleBroadcastMessage).toBe('Voting will close soon.')
  })
})
