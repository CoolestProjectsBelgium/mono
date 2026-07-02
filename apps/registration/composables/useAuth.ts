import type { LoginDto, LoginMailDto, LoginActivateDto } from '~/types/api'
import { getApiErrorMessage, hasApiData } from '~/utils/api-response'

export function useAuth() {
  const { apiFetch } = useApiClient()
  const authStore = useAuthStore()
  const { notify } = useNotification()

  async function requestMagicLink(email: string): Promise<boolean> {
    const body: LoginMailDto = { email }
    try {
      await apiFetch<LoginDto | null>('/login/mailToken', {
        method: 'POST',
        body,
      })
      notify('success', 'login.linkSent')
      return true
    }
    catch (error) {
      notify('error', 'error_An error occurred', undefined, getApiErrorMessage(error))
      return false
    }
  }

  async function activateWithToken(jwt: string): Promise<boolean> {
    const body: LoginActivateDto = { jwt }
    try {
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
    catch {
      return false
    }
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
