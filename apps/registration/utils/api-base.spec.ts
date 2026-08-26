import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { resolveApiBase } from './api-base'

describe('resolveApiBase', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { hostname: 'registration.coolestprojects.localhost', protocol: 'https:' },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns configured base for proxy hostnames', () => {
    expect(resolveApiBase('https://api.coolestprojects.localhost:8443'))
      .toBe('https://api.coolestprojects.localhost:8443')
  })

  it('uses localhost:3001 when the app is opened via port-forward', () => {
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', protocol: 'http:' },
    })

    expect(resolveApiBase('https://api.coolestprojects.localhost:8443'))
      .toBe('http://localhost:3001')
  })
})
