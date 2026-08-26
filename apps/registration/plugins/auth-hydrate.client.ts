import { hydrateAuthStoreFromStorage } from '~/utils/auth-storage'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:start', () => {
    hydrateAuthStoreFromStorage()
  })
})
