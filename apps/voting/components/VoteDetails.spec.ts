import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import VoteDetails from './VoteDetails.vue'

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

  return mount(Wrapper, {
    global: {
      stubs: {
        UButton: { template: '<button type="button" @click="$attrs.onClick"><slot /></button>' },
        UCard: { template: '<div><slot name="header" /><slot /><slot name="footer" /></div>' },
        UBadge: { template: '<span><slot /></span>' },
        UIcon: true,
        UModal: { template: '<div><slot /></div>' },
      },
    },
  })
}

describe('VoteDetails', () => {
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
    const wrapper = mount(Wrapper, {
      global: {
        stubs: {
          UButton: { template: '<button type="button" @click="$attrs.onClick"><slot /></button>' },
          UCard: { template: '<div><slot name="header" /><slot /><slot name="footer" /></div>' },
          UBadge: { template: '<span><slot /></span>' },
          UIcon: true,
          UModal: { template: '<div><slot /></div>' },
        },
      },
    })
    const skipButton = wrapper.findAll('button').find(button => button.text().includes('Skip Project'))
    await skipButton?.trigger('click')
    expect(wrapper.vm.skipped).toBe(true)
  })
})
