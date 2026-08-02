import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import GeneralQuestions from './GeneralQuestions.vue'
import type { QuestionDto } from '~/types/api'

const questions: QuestionDto[] = [
  {
    id: 1,
    name: 'q1',
    description: 'Do you agree?',
    positive: 'Yes',
    negative: 'No',
  },
]

describe('GeneralQuestions', () => {
  it('adds question id when yes is selected', async () => {
    const model = ref<string[]>([])
    const answeredIds = ref<string[]>([])
    const wrapper = mount(GeneralQuestions, {
      props: {
        questions,
        answeredIds: answeredIds.value,
        modelValue: model.value,
        'onUpdate:modelValue': (value: string[]) => {
          model.value = value
        },
        onAnswer: (id: string) => {
          if (!answeredIds.value.includes(id)) {
            answeredIds.value.push(id)
          }
        },
      },
      global: {
        stubs: {
          FormSection: {
            template: '<div><slot /></div>',
            props: ['title'],
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const yesInput = wrapper.find('input[type="radio"]')
    await yesInput.trigger('click')

    expect(model.value).toContain('1')
    expect(answeredIds.value).toContain('1')
  })

  it('registers pre-filled yes values as answered on mount', () => {
    const answeredIds = ref<string[]>([])
    mount(GeneralQuestions, {
      props: {
        questions,
        answeredIds: answeredIds.value,
        modelValue: ['1'],
        onAnswer: (id: string) => {
          if (!answeredIds.value.includes(id)) {
            answeredIds.value.push(id)
          }
        },
      },
      global: {
        stubs: {
          FormSection: {
            template: '<div><slot /></div>',
            props: ['title'],
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(answeredIds.value).toContain('1')
  })

  it('tracks no answers via answeredIds prop', async () => {
    const model = ref<string[]>([])
    const answeredIds = ref<string[]>([])
    const wrapper = mount(GeneralQuestions, {
      props: {
        questions,
        answeredIds: answeredIds.value,
        modelValue: model.value,
        'onUpdate:modelValue': (value: string[]) => {
          model.value = value
        },
        onAnswer: (id: string) => {
          if (!answeredIds.value.includes(id)) {
            answeredIds.value.push(id)
          }
        },
      },
      global: {
        stubs: {
          FormSection: {
            template: '<div><slot /></div>',
            props: ['title'],
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const inputs = wrapper.findAll('input[type="radio"]')
    await inputs[1].trigger('click')

    expect(model.value).not.toContain('1')
    expect(answeredIds.value).toContain('1')
  })
})
