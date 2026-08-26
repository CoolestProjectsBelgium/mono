import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  AUTH_STORAGE_KEY,
  hydrateAuthStoreFromStorage,
  isLoggedInFromStorage,
  normalizeExpires,
  readStoredAuth,
} from './auth-storage'

function createLocalStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
  }
}

describe('auth-storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('readStoredAuth returns null when storage is empty', () => {
    expect(readStoredAuth()).toBeNull()
  })

  it('hydrateAuthStoreFromStorage restores expires from localStorage', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
      language: 'fr',
    }))

    expect(hydrateAuthStoreFromStorage()).toBe(true)
    expect(useAuthStore().isLoggedIn).toBe(true)
    expect(useAuthStore().language).toBe('fr')
  })

  it('normalizeExpires rejects invalid values', () => {
    expect(normalizeExpires('not-a-date')).toBeNull()
    expect(normalizeExpires('2099-01-01T00:00:00.000Z')).toBe('2099-01-01T00:00:00.000Z')
  })

  it('hydrateAuthStoreFromStorage prefers valid localStorage over stale pinia expires', () => {
    useAuthStore().setExpires('2020-01-01T00:00:00.000Z')
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
      language: 'fr',
    }))

    expect(hydrateAuthStoreFromStorage()).toBe(true)
    expect(useAuthStore().isLoggedIn).toBe(true)
    expect(useAuthStore().language).toBe('fr')
  })

  it('hydrateAuthStoreFromStorage falls back to storage when pinia is unavailable', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
    }))
    setActivePinia(undefined!)

    expect(hydrateAuthStoreFromStorage()).toBe(true)
    expect(isLoggedInFromStorage()).toBe(true)
  })

  it('hydrateAuthStoreFromStorage keeps valid pinia session over older localStorage', () => {
    useAuthStore().setExpires('2099-06-01T00:00:00.000Z')
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
    }))

    expect(hydrateAuthStoreFromStorage()).toBe(true)
    expect(useAuthStore().expires).toBe('2099-06-01T00:00:00.000Z')
  })
})
