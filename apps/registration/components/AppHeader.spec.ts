import { describe, expect, it, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import AppHeader from './AppHeader.vue'
import { mockFetch } from '~/tests/setup'

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
    document.body.style.overflow = ''
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
    expect(logo.classes()).toContain('h-12')
    expect(logo.classes()).toContain('lg:h-20')
    expect(wrapper.get('[data-testid="site-logo-link"]').classes()).not.toContain('lg:absolute')
    expect(wrapper.find('[data-testid="site-logo-spacer"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Coolest Projects')
    expect(wrapper.text()).toContain('Inloggen')
    expect(wrapper.text()).not.toContain('Uitloggen')
    const current = wrapper.find('nav [aria-current="page"]')
    expect(current.exists()).toBe(true)
    expect(current.text()).toBe('Info')
    expect(wrapper.find('[data-testid="mobile-menu-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mobile-nav-panel"]').exists()).toBe(false)
    const desktopNav = wrapper.findAll('nav').find(nav => nav.attributes('class')?.includes('lg:flex'))
    expect(desktopNav).toBeTruthy()
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
    expect(wrapper.text()).not.toContain('Inloggen')
  })

  it('opens mobile panel with guest links when hamburger is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        stubs: { LanguageSwitcher: true },
      },
    })

    await wrapper.get('[data-testid="mobile-menu-button"]').trigger('click')

    const panel = wrapper.get('[data-testid="mobile-nav-panel"]')
    expect(panel.text()).toContain('Info')
    expect(panel.text()).toContain('Reglement')
    expect(panel.text()).toContain('Inloggen')
    expect(wrapper.get('[data-testid="mobile-menu-button"]').attributes('aria-expanded')).toBe('true')
  })

  it('opens mobile panel with authenticated links when logged in', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).setExpires('2099-01-01T00:00:00.000Z')
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        plugins: [pinia],
        stubs: { LanguageSwitcher: true },
      },
    })

    await wrapper.get('[data-testid="mobile-menu-button"]').trigger('click')

    const panel = wrapper.get('[data-testid="mobile-nav-panel"]')
    expect(panel.text()).toContain('Gebruiker')
    expect(panel.text()).toContain('Project')
    expect(panel.text()).toContain('Uitloggen')
    expect(panel.text()).not.toContain('Inloggen')
  })

  it('closes mobile panel when backdrop is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        stubs: { LanguageSwitcher: true },
      },
    })

    await wrapper.get('[data-testid="mobile-menu-button"]').trigger('click')
    expect(wrapper.find('[data-testid="mobile-nav-panel"]').exists()).toBe(true)

    await wrapper.get('[data-testid="mobile-nav-backdrop"]').trigger('click')
    expect(wrapper.find('[data-testid="mobile-nav-panel"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="mobile-menu-button"]').attributes('aria-expanded')).toBe('false')
  })

  it('closes mobile panel when a nav link is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader, {
      global: {
        stubs: { LanguageSwitcher: true },
      },
    })

    await wrapper.get('[data-testid="mobile-menu-button"]').trigger('click')
    const loginLink = wrapper.get('[data-testid="mobile-nav-panel"] a[href="/login"]')
    await loginLink.trigger('click')

    expect(wrapper.find('[data-testid="mobile-nav-panel"]').exists()).toBe(false)
  })
})
