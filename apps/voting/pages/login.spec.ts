import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'

describe('login session recovery', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
  })

  it('clears stale jwt when login page resets session', () => {
    const store = useAuthStore()
    store.setJwt('stale-token')
    store.clearSession()
    expect(store.loggedIn).toBe(false)
    expect(store.jwt).toBeNull()
  })
})
