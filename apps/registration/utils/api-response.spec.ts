import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isEmptyApiResponse, resolveApiUiState } from '~/utils/api-response'

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

  it('reads NestJS error message from fetch error data', () => {
    const message = getApiErrorMessage({
      name: 'FetchError',
      message: '[POST] "/registration": 400 Bad Request',
      data: {
        statusCode: 400,
        message: 'Guardian email and phone number are required for participants under 16 years old.',
      },
    })
    expect(message).toBe('Guardian email and phone number are required for participants under 16 years old.')
  })

  it('reads ApiError message from the error object itself', () => {
    const message = getApiErrorMessage({
      name: 'ApiError',
      message: 'Registration is not open for this event.',
    })
    expect(message).toBe('Registration is not open for this event.')
  })
})
