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
    expect(wrapper.text()).toContain('Inloggen')
    expect(wrapper.text()).not.toContain('Uitloggen')
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
