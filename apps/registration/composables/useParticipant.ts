import type { ParticipantDto } from '~/types/api'
import { hasApiData, resolveApiUiState } from '~/utils/api-response'
import {
  buildInviteMailtoUrl,
  buildRegistrationInviteUrl,
} from '~/utils/participant-invite'

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
    return apiFetch<ParticipantDto>('/participant', { method: 'POST' })
  }

  async function removeParticipant(id: number): Promise<boolean> {
    const result = await apiFetch<null>(`/participant/${id}`, { method: 'DELETE' })
    return result !== undefined
  }

  async function leaveProject(): Promise<boolean> {
    const result = await apiFetch<null>('/participant/self', { method: 'DELETE' })
    return result !== undefined
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

  function openInviteMailto(token: string, projectName?: string): void {
    if (!import.meta.client) {
      return
    }

    const inviteUrl = buildInviteUrl(token)
    const subject = t('participantMailSubject', { projectName: projectName ?? '' })
    const body = t('participantMailBody', { url: inviteUrl, projectName: projectName ?? '' })
    window.location.href = buildInviteMailtoUrl(subject, body)
  }

  function getInviteState(participant: ParticipantDto | null) {
    return resolveApiUiState(participant)
  }

  function hasInviteToken(participant: ParticipantDto | null): participant is ParticipantDto {
    return hasApiData(participant)
  }

  function isPendingParticipant(participant: ParticipantDto): boolean {
    return participant.status === 'pending' && Boolean(participant.token)
  }

  return {
    generateInviteToken,
    removeParticipant,
    leaveProject,
    buildInviteUrl,
    copyInviteUrl,
    openInviteMailto,
    getInviteState,
    hasInviteToken,
    isPendingParticipant,
  }
}
