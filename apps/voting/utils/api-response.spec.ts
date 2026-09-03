import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './api-response'

describe('getApiErrorMessage', () => {
  it('reads message from response body', () => {
    expect(getApiErrorMessage({ data: { message: 'Invalid credentials' } }))
      .toBe('Invalid credentials')
  })

  it('returns undefined for empty errors', () => {
    expect(getApiErrorMessage(null)).toBeUndefined()
  })
})
