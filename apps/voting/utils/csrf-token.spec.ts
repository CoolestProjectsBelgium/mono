import { describe, expect, it, beforeEach, vi } from 'vitest'
import { clearCsrfToken, ensureCsrfToken, isUnsafeMethod } from './csrf-token'
import { mockFetch } from '~/tests/setup'

const API_BASE = 'https://api.coolestprojects.localhost:8443'

describe('csrf-token', () => {
  beforeEach(() => {
    clearCsrfToken()
    mockFetch.mockReset()
  })

  it('detects unsafe HTTP methods', () => {
    expect(isUnsafeMethod('POST')).toBe(true)
    expect(isUnsafeMethod('get')).toBe(false)
  })

  it('fetches and caches the CSRF token', async () => {
    mockFetch.mockResolvedValue({ csrfToken: 'token-1' })

    await expect(ensureCsrfToken(API_BASE)).resolves.toBe('token-1')
    await expect(ensureCsrfToken(API_BASE)).resolves.toBe('token-1')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/csrf-token', {
      baseURL: API_BASE,
      credentials: 'include',
    })
  })
})
