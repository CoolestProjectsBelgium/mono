import type { FetchOptions } from 'ofetch'

export async function useApiFetch<T>(
  path: string,
  options: FetchOptions<'json'> = {},
): Promise<T> {
  const { apiFetch } = useApiClient()
  return apiFetch<T>(path, options)
}
