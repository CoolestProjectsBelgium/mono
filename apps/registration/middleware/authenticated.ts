import { hydrateAuthStoreFromStorage } from '~/utils/auth-storage'

export default defineNuxtRouteMiddleware(() => {
  // Auth lives in localStorage; only enforce on the client (ssr: false).
  if (import.meta.server) {
    return
  }

  if (!hydrateAuthStoreFromStorage()) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'))
  }
})
