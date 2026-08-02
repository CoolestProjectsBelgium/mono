export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  // Magic-link login must run even when Pinia still has a stale session (cookie may be gone).
  if (to.query.token) {
    return
  }
  if (authStore.isLoggedIn) {
    return navigateTo('/user')
  }
})
