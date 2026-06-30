export const state = () => ({
  languages: []
})

export const mutations = {
  updateLanguages (state, languages) {
    state.languages = languages
  }
}
