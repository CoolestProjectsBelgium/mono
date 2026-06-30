import type { RegistrationDto, UserDto, ProjectDto } from '~/types/api'

export interface RegistrationFormState {
  user: UserDto
  isOwnProject: boolean
  ownProject: {
    project_name: string
    project_descr: string
    project_type: string
    project_lang: 'nl' | 'fr' | 'en'
  }
  otherProject: {
    project_code: string
  }
  mandatoryApprovals: string[]
}

export function buildRegistrationPayload(form: RegistrationFormState): RegistrationDto {
  const project: ProjectDto = form.isOwnProject
    ? {
        own_project: {
          project_name: form.ownProject.project_name,
          project_descr: form.ownProject.project_descr,
          project_type: form.ownProject.project_type,
          project_lang: form.ownProject.project_lang,
        },
      }
    : {
        other_project: {
          project_code: form.otherProject.project_code,
        },
      }

  return {
    user: {
      ...form.user,
      mandatory_approvals: form.mandatoryApprovals,
    },
    project,
  }
}

export function createEmptyUser(): UserDto {
  return {
    language: 'nl',
    email: '',
    firstname: '',
    lastname: '',
    sex: 'm',
    gsm: '',
    general_questions: [],
    mandatory_approvals: [],
    year: 0,
    month: -1,
    t_size: 0,
    gsm_guardian: '',
    email_guardian: '',
    via: '',
    medical: '',
    address: {
      street: '',
      house_number: '',
      municipality_name: '',
      box_number: '',
      postalcode: 0,
    },
  }
}
