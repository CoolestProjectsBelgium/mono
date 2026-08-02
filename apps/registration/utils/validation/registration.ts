import { z } from 'zod'

export function createMandatoryApprovalsSchema(approvalIds: string[]) {
  return z.object({
    mandatory_approvals: z.array(z.string()).superRefine((selected, ctx) => {
      const missing = approvalIds.filter(id => !selected.includes(id))
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [],
          message: 'Mandatory approvals required',
        })
      }
    }),
  })
}

export function collectAnsweredGeneralQuestionIds(form: {
  answeredGeneralQuestionIds: string[]
  user: { general_questions: string[] }
}): Set<string> {
  return new Set([
    ...(form.answeredGeneralQuestionIds ?? []).map(String),
    ...form.user.general_questions.map(String),
  ])
}

export function validateGeneralQuestionsAnswered(
  questionIds: string[],
  answeredIds: Set<string>,
): z.SafeParseReturnType<unknown, unknown> {
  const schema = z.object({}).superRefine((_data, ctx) => {
    for (const id of questionIds) {
      if (!answeredIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['general_questions', id],
          message: 'General question required',
        })
      }
    }
  })
  return schema.safeParse({})
}
