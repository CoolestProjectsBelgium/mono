import type { LoginDto, LoginMailDto, LoginActivateDto } from '~/types/api'
import { hasApiData } from '~/utils/api-response'

export function useAuth() {
  const { apiFetch } = useApiClient()
  const authStore = useAuthStore()
  const { notify } = useNotification()

  async function requestMagicLink(email: string): Promise<boolean> {
    const body: LoginMailDto = { email }
    const response = await apiFetch<LoginDto | null>('/login/mailToken', {
      method: 'POST',
      body,
    })
    // Backend may return null while not wired — still show success UX per plan
    if (hasApiData(response)) {
      authStore.setExpires(response.expires)
    }
    notify('success', 'login.linkSent')
    return true
  }

  async function activateWithToken(jwt: string): Promise<boolean> {
    const body: LoginActivateDto = { jwt }
    const response = await apiFetch<LoginDto | null>('/login', {
      method: 'POST',
      body,
    })
    if (!hasApiData(response)) {
      return false
    }
    authStore.setSession(response)
    return true
  }

  async function logout(): Promise<void> {
    await apiFetch<null>('/login/logout', { method: 'POST' })
    authStore.clearSession()
  }

  return {
    requestMagicLink,
    activateWithToken,
    logout,
    isLoggedIn: computed(() => authStore.isLoggedIn),
  }
}
