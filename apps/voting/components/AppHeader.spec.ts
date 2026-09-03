import { describe, expect, it, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import AppHeader from './AppHeader.vue'
import { useAuthStore } from '~/stores/auth'

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.style.overflow = ''
  })

  it('shows logo and jury voting badge', async () => {
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.get('header').classes()).toContain('sticky')
    const logo = wrapper.get('[data-testid="site-logo"]')
    expect(logo.attributes('alt')).toBe('Coolest Projects Belgium')
    expect(logo.attributes('src')).toContain('logo-coolest-projects-belgium.png')
    expect(wrapper.get('[data-testid="jury-voting-badge"]').text()).toBe('Jury voting')
  })

  it('shows nav and user email when authenticated', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useAuthStore(pinia)
    store.setJwt('token')
    store.setUser({ id: 1, email: 'jury@example.com', eventId: 1 })

    const wrapper = await mountSuspended(AppHeader, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.text()).toContain('Project languages')
    expect(wrapper.text()).toContain('Vote')
    expect(wrapper.get('[data-testid="user-email"]').text()).toContain('jury@example.com')
    expect(wrapper.get('[data-testid="logout-button"]').exists()).toBe(true)
  })
})
