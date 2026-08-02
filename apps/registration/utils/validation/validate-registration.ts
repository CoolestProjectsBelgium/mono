import type { ApprovalDto, QuestionDto, SettingDto } from '~/types/api'
import type { RegistrationFormState } from '~/utils/registration-payload'
import { mapZodIssuesToFieldErrors } from '~/utils/validation/map-field-errors'
import {
  collectAnsweredGeneralQuestionIds,
  createMandatoryApprovalsSchema,
  validateGeneralQuestionsAnswered,
} from '~/utils/validation/registration'
import {
  createOtherProjectSchema,
  createOwnProjectSchema,
  createUserSchema,
} from '~/utils/validation/user'

export function validateRegistrationForm(
  form: RegistrationFormState,
  settings: SettingDto,
  approvals: ApprovalDto[],
  questionIds: string[],
  translate: (key: string) => string,
): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {}

  const userResult = createUserSchema({
    minAge: settings.minAge,
    maxAge: settings.maxAge,
    guardianAge: settings.guardianAge,
    officialStartDate: settings.officialStartDate,
  }).safeParse({
    ...form.user,
    mandatory_approvals: form.mandatoryApprovals,
  })

  if (!userResult.success) {
    Object.assign(fieldErrors, mapZodIssuesToFieldErrors(userResult.error.issues, translate))
  }

  const approvalIds = approvals.map(a => String(a.id))
  const approvalsResult = createMandatoryApprovalsSchema(approvalIds).safeParse({
    mandatory_approvals: form.mandatoryApprovals,
  })
  if (!approvalsResult.success) {
    Object.assign(fieldErrors, mapZodIssuesToFieldErrors(approvalsResult.error.issues, translate))
  }

  if (questionIds.length > 0) {
    const questionsResult = validateGeneralQuestionsAnswered(
      questionIds,
      collectAnsweredGeneralQuestionIds(form),
    )
    if (!questionsResult.success) {
      Object.assign(fieldErrors, mapZodIssuesToFieldErrors(questionsResult.error.issues, translate))
    }
  }

  if (form.isOwnProject) {
    const projectResult = createOwnProjectSchema().safeParse(form.ownProject)
    if (!projectResult.success) {
      Object.assign(fieldErrors, mapZodIssuesToFieldErrors(projectResult.error.issues, translate))
    }
  }
  else {
    const projectResult = createOtherProjectSchema().safeParse(form.otherProject)
    if (!projectResult.success) {
      Object.assign(fieldErrors, mapZodIssuesToFieldErrors(projectResult.error.issues, translate))
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null
}

