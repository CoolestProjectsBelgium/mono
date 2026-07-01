import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ValidationAlert from './ValidationAlert.vue'
import nl from '~/locales/nl.json'

const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  messages: { nl },
})

describe('ValidationAlert', () => {
  it('lists each invalid field when multiple errors exist', () => {
    const wrapper = mount(ValidationAlert, {
      props: {
        fieldErrors: {
          email: 'Vul een geldig e-mailadres in.',
          firstname: 'Vul je voornaam in.',
        },
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Vul alle verplichte velden in.')
    expect(wrapper.text()).toContain('Voornaam')
    expect(wrapper.text()).toContain('E-mail adres')
    expect(wrapper.find('ul li').exists()).toBe(true)
  })

  it('shows field label for a single invalid field', () => {
    const wrapper = mount(ValidationAlert, {
      props: {
        fieldErrors: {
          firstname: 'Vul je voornaam in.',
        },
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Voornaam')
    expect(wrapper.text()).toContain('Vul je voornaam in.')
    expect(wrapper.find('ul li').exists()).toBe(true)
  })
})
