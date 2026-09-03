import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import VoteDetails from './VoteDetails.vue'
import { useVotingSessionStore } from '~/stores/votingSession'

const project = {
  project_id: 1,
  title: 'Robot',
  description: 'A cool robot',
  language: 'nl',
  location: 'Table 1',
  categories: [
    { id: 1, name: 'Creativity', max: 5, optional: false, value: 4 },
    { id: 2, name: 'Notes', max: 5, optional: true, value: 0 },
  ],
}

function setOpenVotingWindow() {
  const store = useVotingSessionStore()
  store.setVotingWindow('2020-01-01T00:00:00.000Z', '2099-01-01T00:00:00.000Z')
}

function mountVoteDetails() {
  const Wrapper = defineComponent({
    components: { VoteDetails },
    setup() {
      const model = ref(structuredClone(project))
      const submitted = ref(false)
      const skipped = ref(false)
      return { model, submitted, skipped }
    },
    template: `
      <VoteDetails
        v-model="model"
        @submit="submitted = true"
        @next="skipped = true"
      />
    `,
  })

  return mount(Wrapper)
}

describe('VoteDetails', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setOpenVotingWindow()
  })

  it('renders project title and categories', () => {
    const wrapper = mountVoteDetails()
    expect(wrapper.text()).toContain('Robot')
    expect(wrapper.text()).toContain('Creativity')
  })

  it('submits when mandatory categories are filled', async () => {
    const wrapper = mountVoteDetails()
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.vm.skipped).toBe(false)
    expect(wrapper.vm.submitted).toBe(true)
  })

  it('skips without modal when no mandatory scores are set', async () => {
    const noScoresProject = {
      ...project,
      categories: project.categories.map(category => ({ ...category, value: 0 })),
    }
    const Wrapper = defineComponent({
      components: { VoteDetails },
      setup() {
        const model = ref(structuredClone(noScoresProject))
        const skipped = ref(false)
        return { model, skipped }
      },
      template: '<VoteDetails v-model="model" @next="skipped = true" />',
    })
    const wrapper = mount(Wrapper)
    const skipButton = wrapper.findAll('button').find(button => button.text().includes('Skip project'))
    await skipButton?.trigger('click')
    expect(wrapper.vm.skipped).toBe(true)
  })

  it('hides the submit form when voting is closed', () => {
    const store = useVotingSessionStore()
    store.setVotingWindow('2020-01-01T00:00:00.000Z', '2020-01-02T00:00:00.000Z')

    const wrapper = mountVoteDetails()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.get('[data-testid="voting-phase-notice"]').text()).toContain('Voting is closed')
  })
})
