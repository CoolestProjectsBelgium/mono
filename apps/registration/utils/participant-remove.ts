import type { ParticipantDto } from '~/types/api'

export type ParticipantRemoveConfirm = {
  messageKey: 'participantRemove.confirmRegistered' | 'participantRemove.confirmPending'
  params: { name?: string }
}

export function getParticipantRemoveConfirm(participant: ParticipantDto): ParticipantRemoveConfirm {
  if (participant.status === 'registered' && participant.name) {
    return {
      messageKey: 'participantRemove.confirmRegistered',
      params: { name: participant.name },
    }
  }

  return {
    messageKey: 'participantRemove.confirmPending',
    params: {},
  }
}
