import { defineStore } from 'pinia'
import type { LoginDto } from '~/types/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    expires: null as string | null,
    language: 'nl' as 'nl' | 'fr' | 'en',
  }),
  getters: {
    isLoggedIn: (state) => {
      if (!state.expires) return false
      return new Date(state.expires) > new Date()
    },
  },
  actions: {
    setSession(login: LoginDto) {
      this.expires = login.expires
      this.language = login.language
    },
    setExpires(expires: string) {
      this.expires = expires
    },
    clearSession() {
      this.expires = null
    },
  },
})
