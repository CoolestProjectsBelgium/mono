export type ApiFieldErrorResult = {
  message: string
  fieldErrors: Record<string, string>
}

const API_MESSAGE_PATTERNS: Array<{
  test: RegExp
  fieldErrors: Record<string, string>
  i18nKey?: string
}> = [
  {
    test: /guardian.*required/i,
    fieldErrors: { email_guardian: 'validation_guardianRequired', gsm_guardian: 'validation_guardianRequired' },
    i18nKey: 'validation_guardianRequired',
  },
  {
    test: /guardian cannot be filled/i,
    fieldErrors: { email_guardian: 'validation_guardianNotAllowed', gsm_guardian: 'validation_guardianNotAllowed' },
    i18nKey: 'validation_guardianNotAllowed',
  },
  {
    test: /voucher not found|token is niet gevonden/i,
    fieldErrors: { project_code: 'validation_tokenRequired' },
    i18nKey: 'validation_tokenRequired',
  },
  {
    test: /mandatory questions/i,
    fieldErrors: { mandatory_approvals: 'validation_mandatoryApprovals' },
    i18nKey: 'validation_mandatoryApprovals',
  },
  {
    test: /project name, description, type and language are required/i,
    fieldErrors: {
      project_name: 'validation_projectName',
      project_descr: 'validation_projectDescr',
      project_type: 'validation_projectType',
      project_lang: 'validation_projectLang',
    },
    i18nKey: 'validation_projectIncomplete',
  },
  {
    test: /age requirements/i,
    fieldErrors: { year: 'validation_year', month: 'validation_birthMonth' },
    i18nKey: 'validation_year',
  },
  {
    test: /file validation failed/i,
    fieldErrors: { 'movie-file': 'validation_uploadTooLarge' },
    i18nKey: 'validation_uploadTooLarge',
  },
]

export function mapApiMessageToFieldErrors(
  message: string,
  translate: (key: string) => string,
): ApiFieldErrorResult {
  for (const pattern of API_MESSAGE_PATTERNS) {
    if (!pattern.test.test(message)) {
      continue
    }
    const fieldErrors: Record<string, string> = {}
    for (const [field, key] of Object.entries(pattern.fieldErrors)) {
      fieldErrors[field] = translate(key)
    }
    return {
      message: pattern.i18nKey ? translate(pattern.i18nKey) : message,
      fieldErrors,
    }
  }
  return { message, fieldErrors: {} }
}
