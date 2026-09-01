export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetchUser, logout } = useAuth()
  const authStore = useAuthStore()

  const publicRoutes = ['/login']

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

  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    if (authStore.jwt) {
      try {
        await fetchUser()
      }
      catch {
        await logout()
        return navigateTo('/login')
      }
    }
    else {
      return navigateTo('/login')
    }
  }
})
