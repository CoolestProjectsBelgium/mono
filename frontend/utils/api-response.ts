export type ApiUiState = 'ready' | 'noData' | 'unavailable'

export function isEmptyApiResponse<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined
}

export function resolveApiUiState<T>(value: T | null | undefined): ApiUiState {
  if (isEmptyApiResponse(value)) {
    return 'unavailable'
  }
  if (Array.isArray(value) && value.length === 0) {
    return 'noData'
  }
  return 'ready'
}

export function hasApiData<T>(value: T | null | undefined): value is T {
  return !isEmptyApiResponse(value)
}
