import { defineStore } from 'pinia'
import type { VotingPhase } from '~/utils/voting-window'
import { getVotingPhaseFromWindow } from '~/utils/voting-window'

interface VotingSessionState {
  votingStartDate: string | null
  votingEndDate: string | null
  broadcastMessage: string | null
  messageDismissed: boolean
}

export const useVotingSessionStore = defineStore('votingSession', {
  state: (): VotingSessionState => ({
    votingStartDate: null,
    votingEndDate: null,
    broadcastMessage: null,
    messageDismissed: false,
  }),
  getters: {
    phase(state): VotingPhase {
      return getVotingPhaseFromWindow(
        Date.now(),
        state.votingStartDate,
        state.votingEndDate,
      )
    },
    hasVotingWindow(state): boolean {
      return Boolean(state.votingStartDate && state.votingEndDate)
    },
    visibleBroadcastMessage(state): string | null {
      if (!state.broadcastMessage || state.messageDismissed) {
        return null
      }
      return state.broadcastMessage
    },
  },
  actions: {
    setVotingWindow(start: string, end: string) {
      this.votingStartDate = start
      this.votingEndDate = end
    },
    clearVotingWindow() {
      this.votingStartDate = null
      this.votingEndDate = null
    },
    setBroadcastMessage(message: string | null) {
      this.broadcastMessage = message
      this.messageDismissed = false
    },
    dismissBroadcastMessage() {
      this.messageDismissed = true
    },
    clearSession() {
      this.votingStartDate = null
      this.votingEndDate = null
      this.broadcastMessage = null
      this.messageDismissed = false
    },
  },
})
