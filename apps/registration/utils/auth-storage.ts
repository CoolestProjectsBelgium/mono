import { getActivePinia } from 'pinia'

export const AUTH_STORAGE_KEY = 'cp-auth'

export type StoredAuth = {
  expires?: string
  language?: 'nl' | 'fr' | 'en'
}

export function normalizeExpires(expires: string | Date | null | undefined): string | null {
  if (!expires) {
    return null
  }
  const date = expires instanceof Date ? expires : new Date(expires)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

export function readStoredAuth(): StoredAuth | null {
  if (!import.meta.client || typeof localStorage === 'undefined') {
    return null
  }
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function isStoredAuthLoggedIn(auth: StoredAuth | null | undefined): boolean {
  const expires = normalizeExpires(auth?.expires)
  if (!expires) {
    return false
  }
  return new Date(expires) > new Date()
}

export function isLoggedInFromStorage(): boolean {
  return isStoredAuthLoggedIn(readStoredAuth())
}

function applyStoredAuthToStore(
  authStore: ReturnType<typeof useAuthStore>,
  parsed: StoredAuth,
): boolean {
  const expires = normalizeExpires(parsed.expires)
  if (!expires) {
    return false
  }

  authStore.setExpires(expires)
  if (parsed.language) {
    authStore.language = parsed.language
  }
  return authStore.isLoggedIn
}

/**
 * Restore Pinia auth state from localStorage.
 * Safe before Pinia is installed (e.g. route middleware) — falls back to storage only.
 * Valid storage always wins over a stale or empty Pinia session.
 */
export function hydrateAuthStoreFromStorage(): boolean {
  const parsed = readStoredAuth()
  const storedLoggedIn = isStoredAuthLoggedIn(parsed)
  const pinia = getActivePinia()

  if (!pinia) {
    return storedLoggedIn
  }

  const authStore = useAuthStore(pinia)

  if (authStore.isLoggedIn) {
    return true
  }

  if (storedLoggedIn && parsed) {
    return applyStoredAuthToStore(authStore, parsed)
  }

  return false
}
