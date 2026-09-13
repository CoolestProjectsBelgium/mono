import { describe, expect, it, vi } from 'vitest'
import { resolveEventguideAssetUrl } from '~/utils/api-base'

describe('resolveEventguideAssetUrl', () => {
  it('resolves absolute API URLs against the configured API base', () => {
    expect(
      resolveEventguideAssetUrl(
        'https://api.example.com/eventguide/attachments/1/thumbnail',
        'https://api.example.com',
      ),
    ).toBe('https://api.example.com/eventguide/attachments/1/thumbnail')
  })

  it('uses a same-origin relative path on the eventguide proxy host', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'eventguide.coolestprojects.localhost',
      },
    })

    expect(
      resolveEventguideAssetUrl(
        'https://api.coolestprojects.localhost:8443/eventguide/attachments/1/thumbnail',
        'https://api.coolestprojects.localhost:8443',
      ),
    ).toBe('/eventguide/attachments/1/thumbnail')

    vi.unstubAllGlobals()
  })

  it('returns null for missing URLs', () => {
    expect(resolveEventguideAssetUrl(null, 'https://api.example.com')).toBeNull()
  })
})
