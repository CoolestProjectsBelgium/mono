import { describe, expect, it } from 'vitest'
import { isEmptyApiResponse, resolveApiUiState } from '~/utils/api-response'

describe('api-response', () => {
  it('detects null as empty', () => {
    expect(isEmptyApiResponse(null)).toBe(true)
    expect(resolveApiUiState(null)).toBe('unavailable')
  })

  it('detects undefined as empty', () => {
    expect(isEmptyApiResponse(undefined)).toBe(true)
    expect(resolveApiUiState(undefined)).toBe('unavailable')
  })

  it('returns ready for data', () => {
    expect(resolveApiUiState({ id: 1 })).toBe('ready')
  })

  it('returns noData for empty array', () => {
    expect(resolveApiUiState([])).toBe('noData')
  })
})
