import { describe, expect, it } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import OwnProjectForm from './OwnProjectForm.vue'

describe('OwnProjectForm binding', () => {
  it('updates parent ref when typing project name', async () => {
    const model = ref({
      project_name: 'Old',
      project_descr: 'D',
      project_type: 'T',
      project_lang: 'nl' as const,
    })

    const wrapper = mount(OwnProjectForm, {
      props: {
        modelValue: model.value,
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
          FormField: {
            props: ['fieldId', 'label', 'error'],
            template: '<div><slot :input-id="fieldId" input-class="" /></div>',
          },
        },
        mocks: { $t: (k: string) => k },
      },
    })

    const input = wrapper.get('#project_name')
    await input.setValue('New Name')
    await nextTick()
    expect(model.value.project_name).toBe('New Name')
  })
})
