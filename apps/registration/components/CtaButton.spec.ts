import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CtaButton from './CtaButton.vue'

describe('CtaButton', () => {
  it('renders type="button" by default', () => {
    const wrapper = mount(CtaButton, {
      slots: { default: 'Save' },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('renders type="submit" when passed', () => {
    const wrapper = mount(CtaButton, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('renders type="reset" when passed', () => {
    const wrapper = mount(CtaButton, {
      props: { type: 'reset' },
      slots: { default: 'Reset' },
    })
    expect(wrapper.attributes('type')).toBe('reset')
  })
})
