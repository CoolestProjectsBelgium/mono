import { describe, expect, it } from 'vitest'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'

const t = (key: string) => key

describe('map-api-errors', () => {
  it('maps guardian required message to guardian fields', () => {
    const result = mapApiMessageToFieldErrors(
      'Guardian email and phone number are required for participants under 16 years old.',
      t,
    )
    expect(result.fieldErrors.email_guardian).toBe('validation_guardianRequired')
    expect(result.fieldErrors.gsm_guardian).toBe('validation_guardianRequired')
  })

  it('maps voucher not found to project_code', () => {
    const result = mapApiMessageToFieldErrors('Voucher not found', t)
    expect(result.fieldErrors.project_code).toBe('validation_tokenRequired')
  })

  it('maps project not found or already assigned to project_code', () => {
    const result = mapApiMessageToFieldErrors('Project not found or already assigned', t)
    expect(result.fieldErrors.project_code).toBe('validation_tokenRequired')
  })

  it('maps user already has a project to project_code', () => {
    const result = mapApiMessageToFieldErrors('User already has a project', t)
    expect(result.fieldErrors.project_code).toBe('validation_alreadyHasProject')
    expect(result.message).toBe('validation_alreadyHasProject')
  })

  it('maps project required message to project fields', () => {
    const result = mapApiMessageToFieldErrors(
      'Project name, description, type and language are required when no project code is provided.',
      t,
    )
    expect(result.fieldErrors.project_name).toBe('validation_projectName')
    expect(result.fieldErrors.project_descr).toBe('validation_projectDescr')
  })

  it('maps file validation failed to upload field', () => {
    const result = mapApiMessageToFieldErrors('File validation failed', t)
    expect(result.fieldErrors['photo-file']).toBe('validation_uploadTooLarge')
  })

  it('maps affiliation validation to via', () => {
    const result = mapApiMessageToFieldErrors('Validation: affiliation name is required.', t)
    expect(result.fieldErrors.via).toBe('validation_via')
  })
})
