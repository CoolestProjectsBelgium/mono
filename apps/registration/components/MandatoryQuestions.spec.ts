import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MandatoryQuestions from './MandatoryQuestions.vue'
import type { ApprovalDto } from '~/types/api'

const approvals: ApprovalDto[] = [
  {
    id: 3,
    name: 'Approved',
    description: 'Ga je akkoord met onze regels?',
  },
]

describe('MandatoryQuestions', () => {
  it('links the rules word in the approval description', async () => {
    const model = ref<string[]>([])
    const wrapper = await mountSuspended(MandatoryQuestions, {
      props: {
        approvals,
        modelValue: model.value,
        'onUpdate:modelValue': (value: string[]) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: {
            template: '<div><slot /></div>',
            props: ['title'],
          },
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('regels')
    expect(link.attributes('href')).toContain('/rules')
    expect(wrapper.text()).toContain('Ga je akkoord met onze regels?')
    expect(wrapper.text()).not.toContain('Approved')
  })

  it('appends a rules link when the description has no rules word', async () => {
    const model = ref<string[]>([])
    const wrapper = await mountSuspended(MandatoryQuestions, {
      props: {
        approvals: [{ id: 1, name: 'Approved', description: 'Agree' }],
        modelValue: model.value,
        'onUpdate:modelValue': (value: string[]) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: {
            template: '<div><slot /></div>',
            props: ['title'],
          },
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Reglement')
    expect(link.attributes('href')).toContain('/rules')
    expect(wrapper.text()).not.toContain('Approved')
  })
})
