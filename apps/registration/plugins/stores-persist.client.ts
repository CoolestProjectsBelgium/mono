import { hydrateRegistrationForm } from '~/utils/registration-payload'
import { AUTH_STORAGE_KEY, hydrateAuthStoreFromStorage } from '~/utils/auth-storage'

export default defineNuxtPlugin({
  name: 'stores-persist',
  setup() {
    const authStore = useAuthStore()
    const draftStore = useRegistrationDraftStore()

    hydrateAuthStoreFromStorage()

    const draftSaved = localStorage.getItem('cp-registration-draft')
    if (draftSaved) {
      try {
        draftStore.form = hydrateRegistrationForm(JSON.parse(draftSaved))
      }
      catch { /* ignore corrupt storage */ }
    }

    authStore.$subscribe((_, state) => {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        expires: state.expires,
        language: state.language,
      }))
    })

    draftStore.$subscribe((_, state) => {
      localStorage.setItem('cp-registration-draft', JSON.stringify(state.form))
    })
  },
})
