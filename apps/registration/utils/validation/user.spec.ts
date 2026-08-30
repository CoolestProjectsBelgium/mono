import { describe, expect, it } from 'vitest'
import { activeSettingsFixture } from '~/fixtures/settings'
import { userFixture } from '~/fixtures/user'
import {
  createOwnProjectSchema,
  createUserProfileSchema,
  createUserSchema,
} from '~/utils/validation/user'
import { dojoFixture } from '~/fixtures/dojos'

const settings = {
  minAge: activeSettingsFixture.minAge,
  maxAge: activeSettingsFixture.maxAge,
  guardianAge: activeSettingsFixture.guardianAge,
  officialStartDate: activeSettingsFixture.officialStartDate,
}

const validAdultUser = {
  email: 'adult@example.com',
  firstname: 'Adult',
  lastname: 'Test',
  year: 2008,
  month: 5,
  gsm: '0470123456',
  sex: 'm' as const,
  t_size: 3,
  mandatory_approvals: ['1'],
  address: userFixture.address,
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
      sex: 'm',
      t_size: 2,
      mandatory_approvals: ['1'],
      address: userFixture.address,
    })
    expect(result.success).toBe(false)
  })

  it('passes for adult participant', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse(validAdultUser)
    expect(result.success).toBe(true)
  })

  it('rejects invalid postal code and municipality pairs', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      ...validAdultUser,
      address: {
        ...userFixture.address,
        postalcode: 2800,
        municipality_name: 'Antwerpen',
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing postal code', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      ...validAdultUser,
      address: {
        ...userFixture.address,
        postalcode: 0,
        municipality_name: '',
      },
    })
    expect(result.success).toBe(false)
  })

  it('allows skipping affiliation', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      ...validAdultUser,
      via_type: '',
      via: '',
    })
    expect(result.success).toBe(true)
  })

  it('requires a known dojo when type is dojo', () => {
    const schema = createUserSchema(settings, dojoFixture)
    const result = schema.safeParse({
      ...validAdultUser,
      via_type: 'dojo',
      via: 'Not a Dojo',
    })
    expect(result.success).toBe(false)
  })

  it('requires an organisation name when type is other', () => {
    const schema = createUserSchema(settings)
    const result = schema.safeParse({
      ...validAdultUser,
      via_type: 'other',
      via: '  ',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a known dojo name', () => {
    const schema = createUserSchema(settings, dojoFixture)
    const result = schema.safeParse({
      ...validAdultUser,
      via_type: 'dojo',
      via: 'Balen',
    })
    expect(result.success).toBe(true)
  })
})

describe('createUserProfileSchema', () => {
  it('requires a valid address', () => {
    const schema = createUserProfileSchema(settings)
    const result = schema.safeParse({
      ...validAdultUser,
      address: {
        ...userFixture.address,
        postalcode: 0,
        municipality_name: '',
      },
    })
    expect(result.success).toBe(false)
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

