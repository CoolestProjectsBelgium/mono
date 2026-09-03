import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VotingMessageBanner from './VotingMessageBanner.vue'
import { useVotingSessionStore } from '~/stores/votingSession'

describe('VotingMessageBanner', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows broadcast message from the session store', () => {
    const store = useVotingSessionStore()
    store.setBroadcastMessage('Please finish your remaining projects.')

    const wrapper = mount(VotingMessageBanner)

    expect(wrapper.text()).toContain('Please finish your remaining projects.')
  })

  it('hides after dismiss', async () => {
    const store = useVotingSessionStore()
    store.setBroadcastMessage('Break time in 10 minutes.')

    const wrapper = mount(VotingMessageBanner)
    await wrapper.get('[data-testid="dismiss-broadcast-message"]').trigger('click')

    expect(wrapper.find('[data-testid="voting-message-banner"]').exists()).toBe(false)
  })
})
