export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, token, fetchUser, logout } = useAuth()
  
  // Routes that don't require authentication
  const publicRoutes = ['/login']
  
  // If user is not logged in and trying to access a protected route
  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    // If we have a token stored, try to fetch user (restore session)
    if (token.value) {
      try {
        await fetchUser()
      } catch (error) {
        // Token is invalid, logout and redirect
        await logout()
        return navigateTo('/login')
      }
    } else {
      // No token, redirect to login
      return navigateTo('/login')
    }
  }
  
  // If user is logged in but trying to access login page, redirect to home
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})
