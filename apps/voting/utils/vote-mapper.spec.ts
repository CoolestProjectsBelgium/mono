import { describe, expect, it } from 'vitest'
import { mapCategoriesToVotes } from './vote-mapper'

describe('vote-mapper', () => {
  it('maps categories to vote payloads', () => {
    expect(mapCategoriesToVotes([
      { id: 1, value: 4 },
      { id: 2 },
    ])).toEqual([
      { id: 1, value: 4 },
      { id: 2, value: 0 },
    ])
  })
})
