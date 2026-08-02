import type { ParticipantDto } from '~/types/api'
import { hasApiData } from '~/utils/api-response'
import {
  buildInviteMailtoUrl,
  buildRegistrationInviteUrl,
} from '~/utils/participant-invite'

type VoucherCreatedResponse = {
  project_code: string
}

export function useParticipant() {
  const { apiFetch } = useApiClient()
  const { notify } = useNotification()
  const { locale, t } = useI18n()
  const config = useRuntimeConfig()

  function getRegistrationBaseUrl(): string {
    const configured = config.public.registrationUrl as string | undefined
    if (configured) {
      return configured
    }
    if (import.meta.client) {
      return window.location.origin
    }
    return 'https://registration.coolestprojects.localhost:8443'
  }

  async function generateInviteToken(): Promise<ParticipantDto | null> {
    const response = await apiFetch<VoucherCreatedResponse>('/projectinfo/participant', {
      method: 'POST',
    })
    if (!hasApiData(response) || !response.project_code) {
      return null
    }

    return {
      id: Date.now(),
      name: '',
      self: false,
      status: 'pending',
      token: response.project_code,
    }
  }

  async function removeParticipant(participant: ParticipantDto): Promise<void> {
    if (!participant.token) {
      throw new Error(t('error_An error occurred'))
    }

    await apiFetch<null>(`/projectinfo/participant/${encodeURIComponent(participant.token)}`, {
      method: 'DELETE',
    })
  }

  async function joinProject(projectCode: string): Promise<boolean> {
    await apiFetch<null>('/participant', {
      method: 'POST',
      body: { project_code: projectCode },
    })
    return true
  }

  async function leaveProject(participantId: number, projectCode: string): Promise<boolean> {
    await apiFetch<null>(`/participant/${participantId}`, {
      method: 'DELETE',
      body: { project_code: projectCode },
    })
    return true
  }

  function buildInviteUrl(token: string): string {
    return buildRegistrationInviteUrl(
      getRegistrationBaseUrl(),
      locale.value,
      token,
    )
  }

  async function copyInviteUrl(token: string): Promise<boolean> {
    if (!import.meta.client || !navigator.clipboard?.writeText) {
      notify('error', 'error_An error occurred', undefined, t('participantCopyFailed'))
      return false
    }

    try {
      await navigator.clipboard.writeText(buildInviteUrl(token))
      notify('success', 'participantCopySuccess')
      return true
    }
    catch {
      notify('error', 'error_An error occurred', undefined, t('participantCopyFailed'))
      return false
    }
  }

  async function copyInviteToken(token: string): Promise<boolean> {
    if (!import.meta.client || !navigator.clipboard?.writeText) {
      notify('error', 'error_An error occurred', undefined, t('participantCopyTokenFailed'))
      return false
    }

    try {
      await navigator.clipboard.writeText(token)
      notify('success', 'participantCopyTokenSuccess')
      return true
    }
    catch {
      notify('error', 'error_An error occurred', undefined, t('participantCopyTokenFailed'))
      return false
    }
  }

  function openInviteMailto(token: string, projectName?: string): void {
    if (!import.meta.client) {
      return
    }

    const inviteUrl = buildInviteUrl(token)
    const subject = t('participantMailSubject', { projectName: projectName ?? '' })
    const body = t('participantMailBody', { url: inviteUrl, projectName: projectName ?? '' })
    window.location.href = buildInviteMailtoUrl(subject, body)
  }

  function isPendingParticipant(participant: ParticipantDto): boolean {
    return participant.status === 'pending' && Boolean(participant.token)
  }

  return {
    generateInviteToken,
    removeParticipant,
    joinProject,
    leaveProject,
    buildInviteUrl,
    copyInviteUrl,
    copyInviteToken,
    openInviteMailto,
    isPendingParticipant,
  }
}
