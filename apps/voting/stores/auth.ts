import { defineStore } from 'pinia'
import type { VotingUser } from '~/types/api'
import { getBearerAuthorization } from '~/composables/useVotingToken'

interface AuthState {
  jwt: string | null
  user: VotingUser | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    jwt: null,
    user: null,
  }),
  getters: {
    loggedIn: state => !!state.jwt,
    authorization: (state) => {
      return getBearerAuthorization(state.jwt)
    },
  },
  actions: {
    setJwt(jwt: string) {
      this.jwt = getBearerAuthorization(jwt)
    },
    setUser(user: VotingUser | null) {
      this.user = user
    },
    clearSession() {
      this.jwt = null
      this.user = null
    },
  },
  persist: true,
})
