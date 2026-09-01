import { describe, expect, it } from 'vitest'
import { ApiError } from '~/composables/useApiClient'
import { formatLoginError } from './login-error'

describe('formatLoginError', () => {
  it('includes status code and message for ApiError', () => {
    expect(formatLoginError(new ApiError('invalid csrf token', 403)))
      .toBe('403: invalid csrf token')
  })

  it('falls back for unknown errors', () => {
    expect(formatLoginError(new Error('network')))
      .toBe('network')
    expect(formatLoginError(null))
      .toBe('Please check your credentials and try again.')
  })
})
