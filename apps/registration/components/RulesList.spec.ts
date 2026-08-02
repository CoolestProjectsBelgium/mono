import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RulesList from './RulesList.vue'
import { activeSettingsFixture } from '~/fixtures/settings'
import { longDateFormat } from '~/composables/useLongDate'

const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  datetimeFormats: {
    nl: { long: longDateFormat },
  },
  messages: {
    nl: {
      rule1: 'Rule 1 {maxRegistration}',
      rule2: 'Rule 2 {minAge}-{maxAge}',
      rule3: 'Rule 3',
      rule4: 'Rule 4',
      rule5: 'Rule 5 {maxParticipants}',
      rule6: 'Rule 6 {projectClosedDate}',
      rule7: 'Rule 7 {projectClosedDate}',
      rule8: 'Rule 8 {officialStartDate}',
      rule9: 'Rule 9 {officialStartDate}',
      rule10: 'Rule 10',
      rule10a: '10a',
      rule10b: '10b',
      rule10c: '10c',
      rule10d: 'Privacy {privacy_link}',
      privacy_text: 'privacy',
    },
  },
})

describe('RulesList', () => {
  it('renders rule items from settings', () => {
    const wrapper = mount(RulesList, {
      props: { settings: activeSettingsFixture },
      global: { plugins: [i18n] },
    })
    const items = wrapper.findAll('li')
    expect(items.length).toBe(10)
    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('Rule 3')
  })
})
