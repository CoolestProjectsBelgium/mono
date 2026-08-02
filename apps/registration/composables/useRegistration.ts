import type { ApprovalDto, QuestionDto, TshirtGroupDto } from '~/types/api'
import { buildRegistrationPayload, type RegistrationFormState } from '~/utils/registration-payload'
import { getApiErrorMessage } from '~/utils/api-response'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'

export type SubmitRegistrationResult =
  | { ok: true }
  | { ok: false, error?: string, fieldErrors?: Record<string, string> }

export function useRegistration() {
  const { apiFetch } = useApiClient()
  const { locale, t } = useI18n()
  const { notify } = useNotification()

  const langHeaders = () => ({ 'Accept-Language': locale.value })

  async function fetchTshirts(): Promise<TshirtGroupDto[] | null> {
    return apiFetch<TshirtGroupDto[]>('/tshirts', { headers: langHeaders() })
  }

  async function fetchQuestions(): Promise<QuestionDto[] | null> {
    return apiFetch<QuestionDto[]>('/questions', { headers: langHeaders() })
  }

  async function fetchApprovals(): Promise<ApprovalDto[] | null> {
    return apiFetch<ApprovalDto[]>('/approvals', { headers: langHeaders() })
  }

  async function submitRegistration(form: RegistrationFormState): Promise<SubmitRegistrationResult> {
    const payload = buildRegistrationPayload(form)
    try {
      await apiFetch('/registration', {
        method: 'POST',
        body: payload,
      })
      return { ok: true }
    }
    catch (error) {
      const apiMessage = getApiErrorMessage(error)
      const mapped = mapApiMessageToFieldErrors(apiMessage ?? '', t)
      notify('error', 'error_An error occurred', undefined, mapped.message)
      return { ok: false, error: mapped.message, fieldErrors: mapped.fieldErrors }
    }
  }

  return {
    fetchTshirts,
    fetchQuestions,
    fetchApprovals,
    submitRegistration,
    buildRegistrationPayload,
  }
}
