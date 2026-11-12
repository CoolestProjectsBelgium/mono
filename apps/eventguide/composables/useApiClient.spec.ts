import { beforeEach, describe, expect, it } from 'vitest'
import { ApiError, useApiClient } from '~/composables/useApiClient'
import { mockFetch } from '../tests/setup'

describe('useApiClient', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('calls the API base with a JSON Accept header and returns the body', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const { apiFetch, apiBase } = useApiClient()

    await expect(apiFetch('/eventguide/projects')).resolves.toEqual({ ok: true })
    expect(apiBase.value).not.toMatch(/\/$/)
    expect(mockFetch).toHaveBeenCalledWith('/eventguide/projects', {
      baseURL: apiBase.value,
      headers: { Accept: 'application/json' },
    })
  })

  it('passes options through and lets callers add headers', async () => {
    mockFetch.mockResolvedValue(null)
    const { apiFetch } = useApiClient()

    await apiFetch('/eventguide/projects', {
      query: { eventId: 3 },
      headers: { 'Accept-Language': 'nl' },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/eventguide/projects',
      expect.objectContaining({
        query: { eventId: 3 },
        headers: { 'Accept': 'application/json', 'Accept-Language': 'nl' },
      }),
    )
  })

  it('wraps fetch failures in ApiError with the HTTP status', async () => {
    mockFetch.mockRejectedValue({ statusCode: 404, message: 'Not Found' })
    const error = await useApiClient().apiFetch('/missing').catch(e => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Not Found')
    expect(error.statusCode).toBe(404)
  })

  it('falls back to `status` and a default message', async () => {
    mockFetch.mockRejectedValue({ status: 503 })
    const error = await useApiClient().apiFetch('/down').catch(e => e)

    expect(error.message).toBe('API request failed')
    expect(error.statusCode).toBe(503)
  })
})
