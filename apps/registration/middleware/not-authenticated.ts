import { hydrateAuthStoreFromStorage } from '~/utils/auth-storage'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  // Magic-link login must run even when Pinia still has a stale session (cookie may be gone).
  if (to.query.token) {
    return
  }
  if (hydrateAuthStoreFromStorage()) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/project'))
  }
})
