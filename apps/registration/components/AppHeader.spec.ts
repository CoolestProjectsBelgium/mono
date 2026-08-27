import { describe, expect, it, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import AppHeader from './AppHeader.vue'
import { mockFetch } from '~/tests/setup'

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('shows login when not authenticated', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        stubs: { LanguageSwitcher: true },
      },
    })
    expect(wrapper.get('header').classes()).toContain('sticky')
    const logo = wrapper.get('[data-testid="site-logo"]')
    expect(logo.attributes('alt')).toBe('Coolest Projects Belgium')
    expect(logo.attributes('src')).toContain('logo-coolest-projects-belgium.png')
    expect(logo.classes()).toContain('h-20')
    expect(wrapper.get('[data-testid="site-logo-link"]').classes()).not.toContain('lg:absolute')
    expect(wrapper.find('[data-testid="site-logo-spacer"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Coolest Projects')
    expect(wrapper.text()).toContain('Inloggen')
    expect(wrapper.text()).not.toContain('Uitloggen')
    const current = wrapper.find('nav [aria-current="page"]')
    expect(current.exists()).toBe(true)
    expect(current.text()).toBe('Info')
  })

  it('shows user nav when authenticated', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).setExpires('2099-01-01T00:00:00.000Z')
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        plugins: [pinia],
        stubs: { LanguageSwitcher: true },
      },
    })
    expect(wrapper.text()).toContain('Gebruiker')
    expect(wrapper.text()).toContain('Uitloggen')
  })
})
