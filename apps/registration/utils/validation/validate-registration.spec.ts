import { describe, expect, it } from 'vitest'
import { activeSettingsFixture } from '~/fixtures/settings'
import { validateRegistrationForm } from '~/utils/validation/validate-registration'
import { createEmptyUser } from '~/utils/registration-payload'

const t = (key: string) => key

describe('validateRegistrationForm', () => {
  it('returns multiple field errors for invalid registration', () => {
    const form = {
      user: createEmptyUser(),
      ownProject: {
        project_name: '',
        project_descr: '',
        project_type: '',
        project_lang: 'nl' as const,
      },
      otherProject: { project_code: '' },
      mandatoryApprovals: [],
      answeredGeneralQuestionIds: [],
      isOwnProject: true,
    }

    const errors = validateRegistrationForm(
      form,
      activeSettingsFixture,
      [{ id: 1, name: 'Rules', description: 'Agree' }],
      [],
      t,
    )

    expect(errors).not.toBeNull()
    expect(errors?.email).toBe('validation_email')
    expect(errors?.postalcode).toBe('validation_postalcode')
    expect(errors?.project_name).toBe('validation_projectName')
    expect(errors?.project_descr).toBe('validation_projectDescr')
    expect(errors?.project_type).toBe('validation_projectType')
    expect(errors?.mandatory_approvals).toBe('validation_mandatoryApprovals')
  })

  it('passes when all general questions are answered', () => {
    const form = {
      user: createEmptyUser(),
      ownProject: {
        project_name: 'Project',
        project_descr: 'Description',
        project_type: 'Scratch',
        project_lang: 'nl' as const,
      },
      otherProject: { project_code: '' },
      mandatoryApprovals: ['1'],
      answeredGeneralQuestionIds: ['1', '2'],
      isOwnProject: true,
    }

    const errors = validateRegistrationForm(
      form,
      activeSettingsFixture,
      [{ id: 1, name: 'Rules', description: 'Agree' }],
      ['1', '2'],
      t,
    )

    expect(errors?.['general_questions.1']).toBeUndefined()
    expect(errors?.['general_questions.2']).toBeUndefined()
  })
})
