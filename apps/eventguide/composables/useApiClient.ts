import type { FetchOptions } from 'ofetch'
import { resolveApiBase } from '~/utils/api-base'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const apiBase = resolveApiBase(config.public.apiBaseURL as string)

  async function apiFetch<T>(
    path: string,
    options: FetchOptions<'json'> = {},
  ): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL: apiBase,
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers as Record<string, string> | undefined),
        },
      })
    }
    catch (error: unknown) {
      const fetchError = error as { statusCode?: number, status?: number, message?: string }
      throw new ApiError(
        fetchError.message ?? 'API request failed',
        fetchError.statusCode ?? fetchError.status,
      )
    }
  }

  return {
    apiFetch,
    apiBase,
  }
}
