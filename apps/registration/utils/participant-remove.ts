import type { ParticipantDto } from '~/types/api'

export type ParticipantRemoveConfirm = {
  key: 'participantRemoveConfirmRegistered' | 'participantRemoveConfirmPending'
  params: { name?: string }
}

export function getParticipantRemoveConfirm(participant: ParticipantDto): ParticipantRemoveConfirm {
  if (participant.status === 'registered' && participant.name) {
    return {
      key: 'participantRemoveConfirmRegistered',
      params: { name: participant.name },
    }
  }

  return {
    key: 'participantRemoveConfirmPending',
    params: {},
  }
}
