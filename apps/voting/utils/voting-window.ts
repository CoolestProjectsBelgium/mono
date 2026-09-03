export type VotingPhase = 'upcoming' | 'open' | 'closed'

export function getVotingPhase(
  now: number,
  startIso: string,
  endIso: string,
): VotingPhase {
  const start = Date.parse(startIso)
  const end = Date.parse(endIso)

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 'closed'
  }

  if (now < start) {
    return 'upcoming'
  }

  if (now > end) {
    return 'closed'
  }

  return 'open'
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

export function getCountdownLabel(
  phase: VotingPhase,
  now: number,
  startIso: string,
  endIso: string,
): string {
  const start = Date.parse(startIso)
  const end = Date.parse(endIso)

  switch (phase) {
    case 'upcoming':
      return `Voting opens in ${formatDuration(start - now)}`
    case 'open':
      return `${formatDuration(end - now)} remaining`
    case 'closed':
      return 'Voting is closed'
  }
}

export function getVotingPhaseFromWindow(
  now: number,
  votingStartDate: string | null,
  votingEndDate: string | null,
): VotingPhase {
  if (!votingStartDate || !votingEndDate) {
    return 'closed'
  }

  return getVotingPhase(now, votingStartDate, votingEndDate)
}
