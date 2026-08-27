import { z } from 'zod'
import {
  getAgeBounds,
  getEligibleMonths,
  getEligibleYears,
  isGuardianRequired,
} from '~/utils/birth-date'
import { isValidPostalMunicipalityPair } from '~/utils/postal-codes/search-postal-codes'
import { isAffiliationComplete, normalizeViaType } from '~/utils/dojos/affiliation'

const BELGIAN_GSM_REGEX = /^((\+|00)32\s?|0)([1-9][0-9]\d{6})\d?$/

const addressSchema = z.object({
  postalcode: z.number().int().min(1000).max(9999),
  municipality_name: z.string().min(1),
  street: z.string().optional(),
  house_number: z.string().optional(),
  box_number: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!isValidPostalMunicipalityPair(data.postalcode, data.municipality_name)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['postalcode'],
      message: 'Invalid postal code and municipality',
    })
  }
})

export function createPersonalFieldsSchema(settings: {
  minAge: number
  maxAge: number
  guardianAge: number
  officialStartDate: string
}) {
  const bounds = getAgeBounds(settings)

  return z.object({
    email: z.string().min(1).email(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    year: z.number().positive(),
    month: z.number().min(-1).max(11),
    gsm: z.string().min(1).regex(BELGIAN_GSM_REGEX),
    sex: z.enum(['m', 'f', 'x']),
    email_guardian: z.string().optional(),
    gsm_guardian: z.string().optional(),
    t_size: z.number().min(1),
    address: addressSchema,
    via_type: z.enum(['', 'dojo', 'other']).optional(),
    via: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (!getEligibleYears(bounds).includes(data.year)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['year'], message: 'Invalid birth year' })
      return
    }

    const eligibleMonths = getEligibleMonths(data.year, bounds)
    if (!eligibleMonths.includes(data.month)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['month'], message: 'Birth month required' })
    }

    if (isGuardianRequired(settings, data.year, data.month)) {
      if (!data.email_guardian || !z.string().email().safeParse(data.email_guardian).success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email_guardian'], message: 'Guardian email required' })
      }
      if (!data.gsm_guardian || !BELGIAN_GSM_REGEX.test(data.gsm_guardian)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gsm_guardian'], message: 'Guardian phone required' })
      }
    }

    const viaType = normalizeViaType(data.via_type)
    if (!isAffiliationComplete(viaType, data.via ?? '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['via'],
        message: viaType === 'dojo' ? 'Unknown dojo' : 'Affiliation name required',
      })
    }
  })
}

export function createUserSchema(settings: {
  minAge: number
  maxAge: number
  guardianAge: number
  officialStartDate: string
}) {
  return createPersonalFieldsSchema(settings).and(
    z.object({
      mandatory_approvals: z.array(z.string()).min(1),
    }),
  )
}

export function createUserProfileSchema(settings: {
  minAge: number
  maxAge: number
  guardianAge: number
  officialStartDate: string
}) {
  return createPersonalFieldsSchema(settings)
}

export function createOwnProjectSchema() {
  return z.object({
    project_name: z.string().min(1).max(100),
    project_descr: z.string().min(1).max(4000),
    project_type: z.string().min(1),
    project_lang: z.enum(['nl', 'fr', 'en']),
  })
}

export function createOtherProjectSchema() {
  return z.object({
    project_code: z.string().min(1),
  })
}
