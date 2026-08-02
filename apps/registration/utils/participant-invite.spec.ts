import { describe, expect, it } from 'vitest'
import {
  buildInviteMailtoUrl,
  buildRegistrationInviteUrl,
} from './participant-invite'

describe('participant-invite', () => {
  it('builds default-language registration invite url', () => {
    expect(
      buildRegistrationInviteUrl(
        'https://registration.example.test',
        'nl',
        'abc-token',
      ),
    ).toBe('https://registration.example.test/registration?token=abc-token')
  })

  it('builds localized registration invite url', () => {
    expect(
      buildRegistrationInviteUrl(
        'https://registration.example.test/',
        'fr',
        'abc token',
      ),
    ).toBe('https://registration.example.test/fr/registration?token=abc%20token')
  })

  it('builds mailto url with encoded subject and body', () => {
    const url = buildInviteMailtoUrl(
      'Join project',
      'Register here: https://example.test/registration?token=abc',
    )

    expect(url.startsWith('mailto:?')).toBe(true)
    expect(url).toContain('subject=Join+project')
    expect(url).toContain('Register+here%3A')
  })
})
