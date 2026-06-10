import { describe, expect, it, beforeEach } from 'vitest'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useAttachments SAS cache', () => {
  beforeEach(() => mockFetch.mockReset())

  it('isSasStillValid returns false for expired SAS', async () => {
    const { isSasStillValid } = await callComposable(() => useAttachments())
    const past = new Date(Date.now() - 60000).toISOString()
    expect(isSasStillValid(`?se=${encodeURIComponent(past)}&sv=2021`)).toBe(false)
  })

  it('isSasStillValid returns true for future SAS', async () => {
    const { isSasStillValid } = await callComposable(() => useAttachments())
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    expect(isSasStillValid(`?se=${encodeURIComponent(future)}&sv=2021`)).toBe(true)
  })

  it('getValidSasForBlob caches SAS', async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    mockFetch.mockResolvedValue({ url: `https://blob.test/file?se=${encodeURIComponent(future)}&sv=2021` })
    const attachments = await callComposable(() => useAttachments())
    const url = 'https://blob.test/container/file.mp4'
    const sas1 = await attachments.getValidSasForBlob(url)
    const sas2 = await attachments.getValidSasForBlob(url)
    expect(sas1).toBe(sas2)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
