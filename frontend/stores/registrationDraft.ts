import { defineStore } from 'pinia'
import { createEmptyUser, type RegistrationFormState } from '~/utils/registration-payload'

function createDefaultForm(): RegistrationFormState {
  return {
    user: createEmptyUser(),
    isOwnProject: true,
    ownProject: {
      project_name: '',
      project_descr: '',
      project_type: '',
      project_lang: 'nl',
    },
    otherProject: {
      project_code: '',
    },
    mandatoryApprovals: [],
  }
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
