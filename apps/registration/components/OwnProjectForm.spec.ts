import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import OwnProjectForm from './OwnProjectForm.vue'

describe('OwnProjectForm', () => {
  it('shows project name error', () => {
    const model = ref({
      project_name: '',
      project_descr: '',
      project_type: '',
      project_lang: 'nl' as const,
    })

    const wrapper = mount(OwnProjectForm, {
      props: {
        modelValue: model.value,
        errors: { project_name: 'validation_projectName' },
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.find('#project_name-error').text()).toBe('validation_projectName')
  })
})
