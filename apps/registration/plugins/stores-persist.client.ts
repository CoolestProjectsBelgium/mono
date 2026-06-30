export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const draftStore = useRegistrationDraftStore()

  const authSaved = localStorage.getItem('cp-auth')
  if (authSaved) {
    try {
      const parsed = JSON.parse(authSaved) as { expires?: string; language?: 'nl' | 'fr' | 'en' }
      if (parsed.expires) authStore.setExpires(parsed.expires)
      if (parsed.language) authStore.language = parsed.language
    }
    catch { /* ignore corrupt storage */ }
  }

  const draftSaved = localStorage.getItem('cp-registration-draft')
  if (draftSaved) {
    try {
      draftStore.form = JSON.parse(draftSaved)
    }
    catch { /* ignore corrupt storage */ }
  }

  authStore.$subscribe((_, state) => {
    localStorage.setItem('cp-auth', JSON.stringify({
      expires: state.expires,
      language: state.language,
    }))
  })

  draftStore.$subscribe((_, state) => {
    localStorage.setItem('cp-registration-draft', JSON.stringify(state.form))
  })
})
