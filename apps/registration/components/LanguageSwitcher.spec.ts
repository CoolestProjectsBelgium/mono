import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LanguageSwitcher from './LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  it('renders locale buttons', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)
    expect(wrapper.text()).toContain('nl')
    expect(wrapper.text()).toContain('fr')
    expect(wrapper.text()).toContain('en')
  })

  it('has active locale marked', async () => {
    const wrapper = await mountSuspended(LanguageSwitcher)
    const activeButton = wrapper.find('button[aria-current="true"]')
    expect(activeButton.exists()).toBe(true)
  })
})
