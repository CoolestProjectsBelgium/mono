import type { UserDto } from '~/types/api'
import { hasApiData, resolveApiUiState } from '~/utils/api-response'

export function useUserinfo() {
  const { apiFetch } = useApiClient()

  async function fetchUser(): Promise<UserDto | null> {
    return apiFetch<UserDto>('/userinfo')
  }

  async function updateUser(user: UserDto): Promise<UserDto | null> {
    return apiFetch<UserDto>('/userinfo', {
      method: 'PATCH',
      body: user,
    })
  }

  async function deleteUser(): Promise<boolean> {
    const result = await apiFetch<null>('/userinfo', { method: 'DELETE' })
    return result !== undefined
  }

  function getProfileState(user: UserDto | null) {
    return resolveApiUiState(user)
  }

  function hasProfile(user: UserDto | null): user is UserDto {
    return hasApiData(user)
  }

  return {
    fetchUser,
    updateUser,
    deleteUser,
    getProfileState,
    hasProfile,
  }
}
