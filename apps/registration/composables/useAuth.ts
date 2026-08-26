import type { LoginDto, LoginMailDto, LoginActivateDto } from '~/types/api'
import { getApiErrorMessage, hasApiData } from '~/utils/api-response'
import { ApiError } from '~/composables/useApiClient'

export type ActivateLoginResult = 'ok' | 'invalid' | 'unavailable'

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

  async function activateWithToken(jwt: string): Promise<ActivateLoginResult> {
    const body: LoginActivateDto = { jwt }
    try {
      const response = await apiFetch<LoginDto | null>('/login', {
        method: 'POST',
        body,
      })
      if (!hasApiData(response)) {
        return 'invalid'
      }
      authStore.setSession(response)
      try {
        await apiFetch<unknown>('/userinfo')
      }
      catch {
        authStore.clearSession()
        return 'invalid'
      }
      return 'ok'
    }
    catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        return 'invalid'
      }
      if (!(error instanceof ApiError) || !error.statusCode || error.statusCode >= 500) {
        return 'unavailable'
      }
      return 'invalid'
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
