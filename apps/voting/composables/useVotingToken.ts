const JWT_MAX_AGE_SECONDS = 60 * 60 * 12

export function useVotingToken() {
  return useCookie<string | null>('voting_jwt', {
    maxAge: JWT_MAX_AGE_SECONDS,
    sameSite: 'strict',
    secure: import.meta.client ? window.location.protocol === 'https:' : false,
    path: '/',
  })
}

export function getBearerAuthorization(token: string | null | undefined): string | null {
  if (!token) {
    return null
  }
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}
