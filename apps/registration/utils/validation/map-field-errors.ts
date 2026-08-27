import type { ZodIssue } from 'zod'

export const FIELD_LABEL_KEYS: Record<string, string> = {
  email: 'label_Email adres:',
  firstname: 'label_Voornaam:',
  lastname: 'label_Achternaam:',
  gsm: 'label_mobiel nummer (+32):',
  postalcode: 'label_postalcode',
  year: 'label_Geboortejaar:',
  month: 'label_Geboortemaand:',
  sex: 'label_Geslacht:',
  t_size: 'label_T-shirt maat:',
  email_guardian: 'label_Email adres ouders/voogd:',
  gsm_guardian: 'label_mobiel nummer ouders/voogd',
  via: 'label_via',
  mandatory_approvals: 'Mandatory Approvals',
  project_name: 'label_Projectnaam:',
  project_descr: 'label_Omschrijving:',
  project_type: 'label_Project_Type',
  project_lang: 'description_taalJury',
  project_code: 'label_Projectcode:',
}

const PATH_TO_I18N_KEY: Record<string, string> = {
  email: 'validation_email',
  firstname: 'validation_firstname',
  lastname: 'validation_lastname',
  gsm: 'validation_gsm',
  postalcode: 'validation_postalcode',
  year: 'validation_year',
  month: 'validation_birthMonth',
  sex: 'validation_sex',
  t_size: 'validation_t_size',
  email_guardian: 'validation_guardianRequired',
  gsm_guardian: 'validation_guardianRequired',
  via: 'validation_via',
  mandatory_approvals: 'validation_mandatoryApprovals',
  project_name: 'validation_projectName',
  project_descr: 'validation_projectDescr',
  project_type: 'validation_projectType',
  project_lang: 'validation_projectLang',
  project_code: 'validation_tokenRequired',
}

export function issuePathToFieldKey(path: (string | number)[]): string {
  if (path[0] === 'general_questions' && path[1] !== undefined) {
    return `general_questions.${path[1]}`
  }
  if (path[0] === 'address' && typeof path[1] === 'string') {
    return path[1]
  }
  const stringSegments = path.filter((segment): segment is string => typeof segment === 'string')
  if (stringSegments.length > 0) {
    return stringSegments[stringSegments.length - 1]
  }
  return '_form'
}

export function fieldLabelForKey(key: string, translate: (labelKey: string) => string): string {
  if (key.startsWith('general_questions.')) {
    return translate('generalQuestions')
  }
  const labelKey = FIELD_LABEL_KEYS[key]
  return labelKey ? translate(labelKey) : key
}

export function buildValidationAlert(
  fieldErrors: Record<string, string>,
  translate: (key: string) => string,
  summaryKey = 'validation_formIncomplete',
): { title: string, items: Array<{ key: string, label: string, message: string }> } {
  const items = Object.entries(fieldErrors)
    .filter(([key]) => key !== '_form')
    .map(([key, message]) => ({
      key,
      label: fieldLabelForKey(key, translate),
      message,
    }))

  if (items.length === 0 && fieldErrors._form) {
    return {
      title: fieldErrors._form,
      items: [],
    }
  }

  if (items.length === 1) {
    return {
      title: translate(summaryKey),
      items,
    }
  }

  return {
    title: translate(summaryKey),
    items,
  }
}

export function issueToI18nKey(issue: ZodIssue): string {
  const fieldKey = issuePathToFieldKey(issue.path)
  if (fieldKey.startsWith('general_questions.')) {
    return 'validation_generalQuestion'
  }
  return PATH_TO_I18N_KEY[fieldKey] ?? 'validation_formIncomplete'
}

export function mapZodIssuesToFieldErrors(
  issues: ZodIssue[],
  translate: (key: string) => string,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const fieldKey = issuePathToFieldKey(issue.path)
    if (!errors[fieldKey]) {
      errors[fieldKey] = translate(issueToI18nKey(issue))
    }
  }
  return errors
}

export function scrollToFirstFieldError(
  fieldErrors: Record<string, string>,
  fieldIdMap: Record<string, string> = {},
) {
  const firstKey = Object.keys(fieldErrors)[0]
  if (!firstKey) {
    return
  }
  const baseId = fieldIdMap[firstKey] ?? firstKey.replace(/\./g, '-')
  const candidates = [baseId, `${baseId}-error`]

  for (const elementId of candidates) {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (element instanceof HTMLElement && typeof element.focus === 'function') {
        element.focus()
      }
      return
    }
  }
}

export function clearFieldError(
  fieldErrors: Record<string, string>,
  fieldKey: string,
): Record<string, string> {
  if (!(fieldKey in fieldErrors)) {
    return fieldErrors
  }
  const next = { ...fieldErrors }
  delete next[fieldKey]
  return next
}
