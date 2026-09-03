export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const { start, stop } = useVotingSse()

  watch(
    () => Boolean(authStore.loggedIn && authStore.user && authStore.authorization),
    (shouldConnect) => {
      if (shouldConnect) {
        void start()
        return
      }

      stop()
    },
    { immediate: true },
  )
})
