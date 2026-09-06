import { isLoggedInFromStorage, isUnauthorizedFetchError } from '~/utils/auth-storage'
import { resolveApiBase } from '~/utils/api-base'

export default defineNuxtPlugin({
  name: 'auth-verify',
  dependsOn: ['stores-persist'],
  async setup() {
    if (!isLoggedInFromStorage()) {
      return
    }

    const config = useRuntimeConfig()
    const apiBase = resolveApiBase(config.public.apiBase as string)

    try {
      await $fetch('/userinfo', {
        baseURL: apiBase,
        credentials: 'include',
      })
    }
    catch (error: unknown) {
      // Keep the client session unless the API rejected the cookie. Network/CORS
      // failures must not log the user out while the httpOnly jwt is still valid.
      if (isUnauthorizedFetchError(error)) {
        useAuthStore().clearSession()
      }
    }
  },
})
