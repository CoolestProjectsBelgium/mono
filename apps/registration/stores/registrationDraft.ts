import { defineStore } from 'pinia'
import {
  hydrateRegistrationForm,
  type RegistrationFormState,
} from '~/utils/registration-payload'

function createDefaultForm(): RegistrationFormState {
  return hydrateRegistrationForm(null)
}

export const useRegistrationDraftStore = defineStore('registrationDraft', {
  state: () => ({
    form: createDefaultForm(),
  }),
  actions: {
    reset() {
      this.form = createDefaultForm()
    },
    prefillToken(token: string) {
      this.form.isOwnProject = false
      this.form.otherProject.project_code = token
    },
  },
})
