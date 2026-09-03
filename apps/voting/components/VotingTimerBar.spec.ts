import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VotingTimerBar from './VotingTimerBar.vue'
import { useVotingSessionStore } from '~/stores/votingSession'

describe('VotingTimerBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-03T11:00:00.000Z'))
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders open phase countdown', () => {
    const store = useVotingSessionStore()
    store.setVotingWindow('2026-09-03T10:00:00.000Z', '2026-09-03T12:00:00.000Z')

    const wrapper = mount(VotingTimerBar)

    expect(wrapper.text()).toContain('1h 0m remaining')
    expect(wrapper.get('[data-testid="voting-phase-badge"]').text()).toBe('Open')
  })

  it('renders closed phase copy', () => {
    const store = useVotingSessionStore()
    store.setVotingWindow('2026-09-03T08:00:00.000Z', '2026-09-03T09:00:00.000Z')

    const wrapper = mount(VotingTimerBar)

    expect(wrapper.text()).toContain('Voting is closed')
    expect(wrapper.get('[data-testid="voting-phase-badge"]').text()).toBe('Closed')
  })
})
