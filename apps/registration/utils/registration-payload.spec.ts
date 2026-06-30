import { describe, expect, it } from 'vitest'
import { userFixture } from '~/fixtures/user'
import { buildRegistrationPayload, type RegistrationFormState } from '~/utils/registration-payload'

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
