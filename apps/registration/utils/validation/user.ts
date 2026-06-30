import { z } from 'zod'
import {
  getAgeBounds,
  getEligibleMonths,
  getEligibleYears,
  isGuardianRequired,
} from '~/utils/birth-date'

export function createUserSchema(settings: {
  minAge: number
  maxAge: number
  guardianAge: number
  officialStartDate: string
}) {
  const bounds = getAgeBounds(settings)

  return z.object({
    email: z.string().email(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    year: z.number().positive(),
    month: z.number().min(-1).max(11),
    gsm: z.string().min(1),
    email_guardian: z.string().optional(),
    gsm_guardian: z.string().optional(),
    t_size: z.number().min(1),
    mandatory_approvals: z.array(z.string()).min(1),
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
      if (!data.gsm_guardian) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gsm_guardian'], message: 'Guardian phone required' })
      }
    }
  })
}

export function createOwnProjectSchema() {
  return z.object({
    project_name: z.string().min(1).max(100),
    project_descr: z.string().max(4000),
    project_type: z.string().min(1),
    project_lang: z.enum(['nl', 'fr', 'en']),
  })
}

export function createOtherProjectSchema() {
  return z.object({
    project_code: z.string().min(1),
  })
}
