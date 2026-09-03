import type { LoginCredentials, LoginResponse, VotingUser } from '~/types/api'
import { useAuthStore } from '~/stores/auth'
import { useVotingSessionStore } from '~/stores/votingSession'

function syncVotingWindowFromUser(user: VotingUser | null) {
  if (!user?.votingStartDate || !user?.votingEndDate) {
    return
  }

  useVotingSessionStore().setVotingWindow(user.votingStartDate, user.votingEndDate)
}

export function useAuth() {
  const { apiFetch } = useApiClient()
  const authStore = useAuthStore()

  const loggedIn = computed(() => authStore.loggedIn)
  const user = computed(() => authStore.user)
  const token = computed({
    get: () => authStore.jwt,
    set: (value: string | null) => {
      authStore.jwt = value
    },
  })

  async function login(credentials: LoginCredentials) {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    authStore.setJwt(response.jwt)
    await fetchUser()
    await navigateTo('/')
  }

  async function fetchUser() {
    if (!authStore.jwt) {
      return
    }
    const user = await apiFetch<VotingUser>('/auth/user')
    authStore.setUser(user)
    syncVotingWindowFromUser(user)
  }

  async function logout() {
    try {
      if (authStore.jwt) {
        await apiFetch('/auth/logout', { method: 'POST' })
      }
    }
    catch {
      // Clear local session even when logout fails
    }
    finally {
      authStore.clearSession()
      await navigateTo('/login')
    }
  }

  return {
    token,
    user,
    loggedIn,
    login,
    logout,
    fetchUser,
  }
}
