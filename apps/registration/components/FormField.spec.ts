import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import FormField from './FormField.vue'

describe('FormField', () => {
  it('renders error text when error prop is set', () => {
    const wrapper = mount(FormField, {
      props: {
        fieldId: 'email',
        label: 'Email',
        error: 'Invalid email',
      },
      slots: {
        default: (slotProps: {
          inputId: string
          inputClass: string
          ariaInvalid: string | undefined
          ariaDescribedby: string | undefined
        }) => h('input', {
          id: slotProps.inputId,
          class: slotProps.inputClass,
          'aria-invalid': slotProps.ariaInvalid,
          'aria-describedby': slotProps.ariaDescribedby,
        }),
      },
    })

    expect(wrapper.find('.form-error-text').text()).toBe('Invalid email')
    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('email-error')
    expect(input.classes()).toContain('form-input-error')
  })
})
