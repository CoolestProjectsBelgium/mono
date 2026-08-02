import { describe, expect, it } from 'vitest'
import type { ZodIssue } from 'zod'
import {
  buildValidationAlert,
  issuePathToFieldKey,
  issueToI18nKey,
  mapZodIssuesToFieldErrors,
} from '~/utils/validation/map-field-errors'

const t = (key: string) => key

function issue(path: (string | number)[], code = 'custom'): ZodIssue {
  return {
    code: 'custom',
    path,
    message: 'test',
  } as ZodIssue
}

describe('map-field-errors', () => {
  it('maps email validation to validation_email', () => {
    const errors = mapZodIssuesToFieldErrors([issue(['email'])], t)
    expect(errors.email).toBe('validation_email')
  })

  it('maps empty firstname to validation_firstname', () => {
    const errors = mapZodIssuesToFieldErrors([issue(['firstname'])], t)
    expect(errors.firstname).toBe('validation_firstname')
  })

  it('maps guardian fields to validation_guardianRequired', () => {
    const errors = mapZodIssuesToFieldErrors([
      issue(['email_guardian']),
      issue(['gsm_guardian']),
    ], t)
    expect(errors.email_guardian).toBe('validation_guardianRequired')
    expect(errors.gsm_guardian).toBe('validation_guardianRequired')
  })

  it('maps year and month fields', () => {
    const errors = mapZodIssuesToFieldErrors([
      issue(['year']),
      issue(['month']),
    ], t)
    expect(errors.year).toBe('validation_year')
    expect(errors.month).toBe('validation_birthMonth')
  })

  it('maps project fields', () => {
    const errors = mapZodIssuesToFieldErrors([
      issue(['project_name']),
      issue(['project_type']),
      issue(['project_code']),
    ], t)
    expect(errors.project_name).toBe('validation_projectName')
    expect(errors.project_type).toBe('validation_projectType')
    expect(errors.project_code).toBe('validation_tokenRequired')
  })

  it('maps general question paths', () => {
    expect(issuePathToFieldKey(['general_questions', '3'])).toBe('general_questions.3')
    expect(issueToI18nKey(issue(['general_questions', '3']))).toBe('validation_generalQuestion')
  })

  it('maps nested address postal code paths', () => {
    expect(issuePathToFieldKey(['address', 'postalcode'])).toBe('postalcode')
    const errors = mapZodIssuesToFieldErrors([issue(['address', 'postalcode'])], t)
    expect(errors.postalcode).toBe('validation_postalcode')
  })

  it('builds a single-field alert listing the field label', () => {
    const alert = buildValidationAlert({ firstname: 'Required' }, t)
    expect(alert.title).toBe('validation_formIncomplete')
    expect(alert.items).toEqual([{ key: 'firstname', label: 'label_Voornaam:', message: 'Required' }])
  })

  it('builds a multi-field alert listing each field', () => {
    const alert = buildValidationAlert({
      email: 'Invalid email',
      firstname: 'Required',
    }, t)
    expect(alert.title).toBe('validation_formIncomplete')
    expect(alert.items).toHaveLength(2)
    expect(alert.items[0].key).toBe('email')
    expect(alert.items[1].key).toBe('firstname')
  })
})
