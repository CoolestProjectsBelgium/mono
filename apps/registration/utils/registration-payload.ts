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
  /** Question IDs the user has answered (yes or no). */
  answeredGeneralQuestionIds: string[]
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
    address: createEmptyAddress(),
  }
}

export function createEmptyAddress(): UserDto['address'] {
  return {
    street: '',
    house_number: '',
    municipality_name: '',
    box_number: '',
    postalcode: 0,
  }
}

/** Merge a persisted or partial draft with current defaults (e.g. new address fields). */
export function hydrateRegistrationForm(
  saved: Partial<RegistrationFormState> | null | undefined,
): RegistrationFormState {
  const defaults = createDefaultFormState()

  if (!saved) {
    return defaults
  }

  return {
    ...defaults,
    ...saved,
    user: {
      ...defaults.user,
      ...saved.user,
      address: {
        ...defaults.user.address,
        ...saved.user?.address,
      },
    },
    ownProject: {
      ...defaults.ownProject,
      ...saved.ownProject,
    },
    otherProject: {
      ...defaults.otherProject,
      ...saved.otherProject,
    },
    mandatoryApprovals: saved.mandatoryApprovals ?? defaults.mandatoryApprovals,
    answeredGeneralQuestionIds:
      saved.answeredGeneralQuestionIds ?? defaults.answeredGeneralQuestionIds,
  }
}

function createDefaultFormState(): RegistrationFormState {
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
    answeredGeneralQuestionIds: [],
  }
}
