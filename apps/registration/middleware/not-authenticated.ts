export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isLoggedIn) {
    return navigateTo('/user')
  }
})
