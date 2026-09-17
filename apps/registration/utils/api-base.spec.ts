import { describe, expect, it } from 'vitest'
import { resolveApiBase } from './api-base'

describe('resolveApiBase', () => {
  it('returns the configured API base', () => {
    expect(resolveApiBase('https://api.coolestprojects.localhost:8443'))
      .toBe('https://api.coolestprojects.localhost:8443')
  })

  it('strips a trailing slash', () => {
    expect(resolveApiBase('https://api.coolestprojects.localhost:8443/'))
      .toBe('https://api.coolestprojects.localhost:8443')
  })
})
