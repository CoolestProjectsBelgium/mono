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
    const wrapper = mount(GeneralQuestions, {
      props: {
        questions,
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
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const yesInput = wrapper.find('input[type="radio"]')
    await yesInput.setValue(true)
    await yesInput.trigger('change')

    expect(model.value).toContain('1')
  })
})
