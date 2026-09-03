import { useAuthStore } from '~/stores/auth'
import { useVotingSessionStore } from '~/stores/votingSession'
import { resolveApiBase } from '~/utils/api-base'
import { connectVotingSse, disconnectVotingSse } from '~/utils/voting-sse-client'

export { applyVotingSseEvent, connectVotingSse, disconnectVotingSse } from '~/utils/voting-sse-client'

export function useVotingSse() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  function syncVotingWindowFromUser() {
    const user = authStore.user
    if (!user?.votingStartDate || !user?.votingEndDate) {
      return
    }

    useVotingSessionStore().setVotingWindow(user.votingStartDate, user.votingEndDate)
  }

  async function start() {
    if (!authStore.authorization) {
      return
    }

    syncVotingWindowFromUser()
    const apiBase = resolveApiBase(config.public.apiBaseURL as string)
    await connectVotingSse(apiBase, authStore.authorization)
  }

  function stop() {
    disconnectVotingSse()
  }

  return {
    start,
    stop,
    syncVotingWindowFromUser,
  }
}
