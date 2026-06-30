import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import EventStatusBanner from './EventStatusBanner.vue'
import { mapSettingsToViewModel } from '~/utils/settings'
import {
  activeSettingsFixture,
  inactiveSettingsFixture,
  closedRegistrationFixture,
  waitingListFixture,
} from '~/fixtures/settings'
import { longDateFormat } from '~/composables/useLongDate'

const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  datetimeFormats: {
    nl: { long: longDateFormat },
  },
  messages: {
    nl: {
      'No Event is active please come again later': 'Geen event',
      'Registration opens on': 'Open {registrationOpenDate} - {registrationClosedDate}',
      'Waiting list is active': 'Wachtlijst actief',
    },
  },
})

function mountBanner(settings: typeof activeSettingsFixture) {
  return mount(EventStatusBanner, {
    props: { viewModel: mapSettingsToViewModel(settings) },
    global: { plugins: [i18n] },
  })
}

describe('EventStatusBanner', () => {
  it('renders inactive alert', () => {
    const wrapper = mountBanner(inactiveSettingsFixture)
    expect(wrapper.text()).toContain('Geen event')
  })

  it('renders registration closed alert', () => {
    const wrapper = mountBanner(closedRegistrationFixture)
    expect(wrapper.text()).toContain('Open')
  })

  it('renders waiting list alert', () => {
    const wrapper = mountBanner(waitingListFixture)
    expect(wrapper.text()).toContain('Wachtlijst actief')
  })

  it('renders no alerts when fully open', () => {
    const wrapper = mountBanner(activeSettingsFixture)
    expect(wrapper.find('[role="status"]').text()).toBe('')
  })
})
