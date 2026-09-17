import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { resolveApiBase } from './api-base'

describe('resolveApiBase', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'voting.coolestprojects.localhost',
        protocol: 'https:',
        port: '8443',
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses same origin on the voting TLS proxy host', () => {
    expect(resolveApiBase('https://api.coolestprojects.localhost:8443'))
      .toBe('https://voting.coolestprojects.localhost:8443')
  })

  it('returns configured base for other hostnames', () => {
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', protocol: 'http:' },
    })

    expect(resolveApiBase('https://api.coolestprojects.localhost:8443'))
      .toBe('https://api.coolestprojects.localhost:8443')
  })
})
