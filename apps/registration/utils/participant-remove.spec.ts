import { describe, expect, it } from 'vitest'
import { getParticipantRemoveConfirm } from './participant-remove'
import type { ParticipantDto } from '~/types/api'

describe('getParticipantRemoveConfirm', () => {
  it('returns pending confirm for pending invites', () => {
    const participant: ParticipantDto = {
      id: 10,
      name: '',
      self: false,
      status: 'pending',
      token: 'invite-token',
    }

    expect(getParticipantRemoveConfirm(participant)).toEqual({
      key: 'participantRemoveConfirmPending',
      params: {},
    })
  })

  it('returns registered confirm with participant name', () => {
    const participant: ParticipantDto = {
      id: 11,
      name: 'Sam',
      self: false,
      status: 'registered',
    }

    expect(getParticipantRemoveConfirm(participant)).toEqual({
      key: 'participantRemoveConfirmRegistered',
      params: { name: 'Sam' },
    })
  })

  it('falls back to pending confirm when registered row has no name', () => {
    const participant: ParticipantDto = {
      id: 12,
      name: '',
      self: false,
      status: 'registered',
    }

    expect(getParticipantRemoveConfirm(participant)).toEqual({
      key: 'participantRemoveConfirmPending',
      params: {},
    })
  })
})
