import type { ApprovalDto, QuestionDto, RegistrationDto, TshirtGroupDto } from '~/types/api'
import { buildRegistrationPayload, type RegistrationFormState } from '~/utils/registration-payload'
import { getApiErrorMessage } from '~/utils/api-response'

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

  async function submitRegistration(form: RegistrationFormState): Promise<{ ok: true } | { ok: false, error?: string }> {
    const payload: RegistrationDto = buildRegistrationPayload(form)
    try {
      await apiFetch('/registration', {
        method: 'POST',
        body: payload,
      })
      notify('success', 'message_successReg')
      return { ok: true }
    }
    catch (error) {
      const message = localizeApiError(getApiErrorMessage(error))
      notify('error', 'error_An error occurred', undefined, message)
      return { ok: false, error: message }
    }
  }

  function localizeApiError(message?: string): string | undefined {
    if (!message) {
      return undefined
    }
    if (/guardian/i.test(message)) {
      return t('validation_guardianRequired')
    }
    return message
  }

  return {
    fetchTshirts,
    fetchQuestions,
    fetchApprovals,
    submitRegistration,
    buildRegistrationPayload,
  }
}
