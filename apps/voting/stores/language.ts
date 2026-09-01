import { defineStore } from 'pinia'

interface LanguageState {
  languages: string[]
}

export const useLanguageStore = defineStore('language', {
  state: (): LanguageState => ({
    languages: [],
  }),
  actions: {
    updateLanguages(languages: string[]) {
      this.languages = languages
    },
  },
  persist: true,
})
