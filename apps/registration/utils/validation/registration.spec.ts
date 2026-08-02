import { describe, expect, it } from 'vitest'
import { collectAnsweredGeneralQuestionIds, createMandatoryApprovalsSchema, validateGeneralQuestionsAnswered } from '~/utils/validation/registration'

describe('createMandatoryApprovalsSchema', () => {
  it('requires all approval ids', () => {
    const schema = createMandatoryApprovalsSchema(['1', '2'])
    expect(schema.safeParse({ mandatory_approvals: ['1'] }).success).toBe(false)
    expect(schema.safeParse({ mandatory_approvals: ['1', '2'] }).success).toBe(true)
  })
})

describe('validateGeneralQuestionsAnswered', () => {
  it('fails when a question is unanswered', () => {
    const result = validateGeneralQuestionsAnswered(['1', '2'], new Set(['1']))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['general_questions', '2'])
    }
  })
})

describe('collectAnsweredGeneralQuestionIds', () => {
  it('merges yes answers and explicitly answered ids', () => {
    const ids = collectAnsweredGeneralQuestionIds({
      answeredGeneralQuestionIds: ['2'],
      user: { general_questions: ['1'] },
    })
    expect(ids).toEqual(new Set(['1', '2']))
  })
})
