import { defineStore } from 'pinia'

interface LanguageState {
  languages: number[]
}

export const useLanguageStore = defineStore('language', {
  state: (): LanguageState => ({
    languages: []
  }),
  actions: {
    updateLanguages(languages: number[]) {
      this.languages = languages
    }
  },
  persist: true // Automatically persist store to localStorage
})
