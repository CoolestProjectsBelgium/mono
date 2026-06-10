import type { ApprovalDto, QuestionDto, RegistrationDto, TshirtGroupDto } from '~/types/api'
import { buildRegistrationPayload, type RegistrationFormState } from '~/utils/registration-payload'

export function useRegistration() {
  const { apiFetch } = useApiClient()
  const { locale } = useI18n()
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

  async function submitRegistration(form: RegistrationFormState): Promise<boolean> {
    const payload: RegistrationDto = buildRegistrationPayload(form)
    try {
      await apiFetch('/registration', {
        method: 'POST',
        body: payload,
      })
      notify('success', 'message_successReg')
      return true
    }
    catch {
      notify('error', 'error_An error occurred')
      return false
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
