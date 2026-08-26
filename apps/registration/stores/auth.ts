import { defineStore } from 'pinia'
import type { LoginDto } from '~/types/api'
import { normalizeExpires } from '~/utils/auth-storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    expires: null as string | null,
    language: 'nl' as 'nl' | 'fr' | 'en',
  }),
  getters: {
    isLoggedIn: (state) => {
      const expires = normalizeExpires(state.expires)
      if (!expires) return false
      return new Date(expires) > new Date()
    },
  },
  actions: {
    setSession(login: LoginDto) {
      this.expires = normalizeExpires(login.expires)
      this.language = login.language
    },
    setExpires(expires: string | Date) {
      this.expires = normalizeExpires(expires)
    },
    clearSession() {
      this.expires = null
    },
  },
})
