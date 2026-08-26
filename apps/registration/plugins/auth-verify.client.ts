import { isLoggedInFromStorage } from '~/utils/auth-storage'
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
    catch {
      useAuthStore().clearSession()
    }
  },
})
