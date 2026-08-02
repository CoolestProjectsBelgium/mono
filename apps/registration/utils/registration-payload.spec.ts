import { describe, expect, it } from 'vitest'
import { userFixture } from '~/fixtures/user'
import {
  buildRegistrationPayload,
  hydrateRegistrationForm,
  hydrateUserProfile,
  type RegistrationFormState,
} from '~/utils/registration-payload'

const baseForm: RegistrationFormState = {
  user: { ...userFixture },
  isOwnProject: true,
  ownProject: {
    project_name: 'My Project',
    project_descr: 'Description',
    project_type: 'Scratch',
    project_lang: 'nl',
  },
  otherProject: { project_code: '' },
  mandatoryApprovals: ['1', '2'],
  answeredGeneralQuestionIds: [],
}

describe('buildRegistrationPayload', () => {
  it('builds own project registration', () => {
    const payload = buildRegistrationPayload({
      ...baseForm,
      user: { ...baseForm.user, general_questions: ['9'] },
    })
    expect(payload.user.email).toBe('test@example.com')
    expect(payload.user.general_questions).toEqual(['9'])
    expect(payload.user.mandatory_approvals).toEqual(['1', '2'])
    expect(payload.project.own_project?.project_name).toBe('My Project')
    expect(payload.project.other_project).toBeUndefined()
  })

  it('builds other project registration with token', () => {
    const form: RegistrationFormState = {
      ...baseForm,
      isOwnProject: false,
      otherProject: { project_code: 'ABC123' },
    }
    const payload = buildRegistrationPayload(form)
    expect(payload.project.other_project?.project_code).toBe('ABC123')
    expect(payload.project.own_project).toBeUndefined()
  })
})

describe('hydrateRegistrationForm', () => {
  it('adds address defaults to legacy persisted drafts', () => {
    const hydrated = hydrateRegistrationForm({
      user: {
        email: 'saved@example.com',
        firstname: 'Saved',
        lastname: 'User',
      } as RegistrationFormState['user'],
      isOwnProject: true,
    })

    expect(hydrated.user.address).toEqual({
      street: '',
      house_number: '',
      municipality_name: '',
      box_number: '',
      postalcode: 0,
    })
    expect(hydrated.user.email).toBe('saved@example.com')
  })
})

describe('hydrateUserProfile', () => {
  it('adds address defaults to partial API user payloads', () => {
    const hydrated = hydrateUserProfile({
      email: 'saved@example.com',
      postalcode: 2800,
    } as Parameters<typeof hydrateUserProfile>[0])

    expect(hydrated.address).toEqual({
      street: '',
      house_number: '',
      municipality_name: '',
      box_number: '',
      postalcode: 0,
    })
    expect(hydrated.email).toBe('saved@example.com')
  })

  it('preserves nested address from the API', () => {
    const hydrated = hydrateUserProfile({
      ...userFixture,
      address: {
        ...userFixture.address,
        postalcode: 2400,
      },
    })

    expect(hydrated.address.postalcode).toBe(2400)
    expect(hydrated.address.municipality_name).toBe(userFixture.address.municipality_name)
  })
})
