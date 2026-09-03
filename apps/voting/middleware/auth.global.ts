export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetchUser, logout } = useAuth()
  const authStore = useAuthStore()

  if (to.path === '/login') {
    if (authStore.jwt) {
      try {
        await fetchUser()
        if (loggedIn.value && authStore.user) {
          return navigateTo('/')
        }
      }
      catch {
        authStore.clearSession()
        clearCsrfToken()
      }
    }
    return
  }

  if (!authStore.jwt) {
    return navigateTo('/login')
  }

  try {
    await fetchUser()
  }
  catch {
    await logout()
    return navigateTo('/login')
  }
})
