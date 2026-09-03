import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import LanguagePage from './language.vue'
import { mockFetch } from '~/tests/setup'

describe('language page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
    mockFetch.mockResolvedValue([
      { id: 'nl', text: 'Dutch' },
      { id: 'fr', text: 'French' },
    ])
  })

  it('renders project language options from the API', async () => {
    const wrapper = await mountSuspended(LanguagePage, {
      global: {
        stubs: {
          AppHeader: true,
          AppFooter: true,
        },
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Dutch')
      expect(wrapper.text()).toContain('French')
    })
    expect(wrapper.text()).toContain('Project languages')
  })
})
