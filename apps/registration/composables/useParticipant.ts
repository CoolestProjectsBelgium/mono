import type { ParticipantDto } from '~/types/api'
import { hasApiData, resolveApiUiState } from '~/utils/api-response'

export function useParticipant() {
  const { apiFetch } = useApiClient()

  async function generateInviteToken(): Promise<ParticipantDto | null> {
    return apiFetch<ParticipantDto>('/participant', { method: 'POST' })
  }

  async function removeParticipant(id: number): Promise<boolean> {
    const result = await apiFetch<null>(`/participant/${id}`, { method: 'DELETE' })
    return result !== undefined
  }

  function getInviteState(participant: ParticipantDto | null) {
    return resolveApiUiState(participant)
  }

  function hasInviteToken(participant: ParticipantDto | null): participant is ParticipantDto {
    return hasApiData(participant)
  }

  return {
    generateInviteToken,
    removeParticipant,
    getInviteState,
    hasInviteToken,
  }
}
