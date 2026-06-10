import { describe, expect, it } from 'vitest'
import { activeSettingsFixture } from '~/fixtures/settings'
import { createOwnProjectSchema, createUserSchema } from '~/utils/validation/user'

const settings = {
  minAge: activeSettingsFixture.minAge,
  maxAge: activeSettingsFixture.maxAge,
  guardianAge: activeSettingsFixture.guardianAge,
  officialStartDate: activeSettingsFixture.officialStartDate,
}

describe('createUserSchema', () => {
  it('requires guardian info for young participants', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      email: 'child@example.com',
      firstname: 'Kid',
      lastname: 'Test',
      year: 2016,
      month: 5,
      gsm: '0470123456',
      t_size: 2,
      mandatory_approvals: ['1'],
    })
    expect(result.success).toBe(false)
  })

  it('passes for adult participant', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      email: 'adult@example.com',
      firstname: 'Adult',
      lastname: 'Test',
      year: 2008,
      month: 5,
      gsm: '0470123456',
      t_size: 3,
      mandatory_approvals: ['1'],
    })
    expect(result.success).toBe(true)
  })
})

describe('createOwnProjectSchema', () => {
  it('validates project name', () => {
    const schema = createOwnProjectSchema()
    expect(schema.safeParse({
      project_name: '',
      project_descr: 'x',
      project_type: 'x',
      project_lang: 'nl',
    }).success).toBe(false)
  })
})
