import { describe, expect, it } from 'vitest'
import { getCountdownLabel, getVotingPhase } from './voting-window'

const start = '2026-09-03T10:00:00.000Z'
const end = '2026-09-03T12:00:00.000Z'

describe('getVotingPhase', () => {
  it('returns upcoming before start', () => {
    expect(getVotingPhase(Date.parse('2026-09-03T09:00:00.000Z'), start, end)).toBe('upcoming')
  })

  it('returns open between start and end', () => {
    expect(getVotingPhase(Date.parse('2026-09-03T11:00:00.000Z'), start, end)).toBe('open')
  })

  it('returns closed after end', () => {
    expect(getVotingPhase(Date.parse('2026-09-03T13:00:00.000Z'), start, end)).toBe('closed')
  })
})

describe('getCountdownLabel', () => {
  it('describes time until voting opens', () => {
    const label = getCountdownLabel(
      'upcoming',
      Date.parse('2026-09-03T09:30:00.000Z'),
      start,
      end,
    )
    expect(label).toBe('Voting opens in 30m 0s')
  })

  it('describes time remaining while open', () => {
    const label = getCountdownLabel(
      'open',
      Date.parse('2026-09-03T11:00:00.000Z'),
      start,
      end,
    )
    expect(label).toBe('1h 0m remaining')
  })

  it('describes closed state', () => {
    expect(getCountdownLabel('closed', Date.now(), start, end)).toBe('Voting is closed')
  })
})
