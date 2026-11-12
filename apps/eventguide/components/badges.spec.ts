import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LanguageBadge from '~/components/LanguageBadge.vue'
import PhotoConsentIcon from '~/components/PhotoConsentIcon.vue'

describe('LanguageBadge', () => {
  it.each([
    ['nl', 'text-primary'],
    ['fr', 'text-gray-700'],
    ['en', 'text-amber-800'],
    ['de', 'text-amber-800'],
  ])('shows %s with its colour class', (language, expectedClass) => {
    const wrapper = mount(LanguageBadge, { props: { language } })
    expect(wrapper.text()).toBe(language)
    expect(wrapper.classes()).toContain(expectedClass)
  })
})

describe('PhotoConsentIcon', () => {
  it('announces consent in green', () => {
    const icon = mount(PhotoConsentIcon, { props: { agreedToPhoto: true } })
      .get('[data-testid="photo-consent-icon"]')
    expect(icon.classes()).toContain('text-green-700')
    expect(icon.attributes('title')).toBe('Photo consent given')
    expect(icon.text()).toBe('Photo consent given')
  })

  it('warns in red when there is no consent', () => {
    const icon = mount(PhotoConsentIcon, { props: { agreedToPhoto: false } })
      .get('[data-testid="photo-consent-icon"]')
    expect(icon.classes()).toContain('text-red-700')
    expect(icon.attributes('title')).toBe('No photo consent')
    expect(icon.text()).toBe('No photo consent')
  })
})
