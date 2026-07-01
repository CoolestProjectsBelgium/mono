import {
  AnonymousCredential,
  BlockBlobClient,
  newPipeline,
} from '@azure/storage-blob'
import type { AttachmentDto, SASToken } from '~/types/api'
import { getApiErrorMessage, hasApiData } from '~/utils/api-response'

type SasCache = Record<string, string>

export type UploadFileCode = 'tooLarge' | 'invalidType' | 'unavailable'

export type UploadFileResult =
  | { ok: true }
  | { ok: false, code: UploadFileCode, message?: string }

const SAS_CACHE_TTL_MS = 2 * 60 * 1000

export function useAttachments() {
  const { apiFetch } = useApiClient()
  const sasCache: SasCache = {}

  function isSasStillValid(sas: string): boolean {
    const expiryString = new URL(`http://hostname${sas}`).searchParams.get('se')
    if (!expiryString) return false
    return new Date(expiryString).getTime() - Date.now() >= SAS_CACHE_TTL_MS
  }

  async function getNewSasForBlob(blobUrl: string): Promise<string | undefined> {
    const parts = blobUrl.split('?')[0].split('/')
    const name = parts[parts.length - 1]
    const response = await apiFetch<SASToken | null>(`/attachments/${name}/sas`, {
      method: 'POST',
    })
    if (!hasApiData(response)) return undefined
    return '?' + response.url.split('?')[1]
  }

  async function getValidSasForBlob(blobUrl: string): Promise<string | undefined> {
    const cached = sasCache[blobUrl]
    if (cached && isSasStillValid(cached)) {
      return cached
    }
    const fresh = await getNewSasForBlob(blobUrl)
    if (fresh) {
      sasCache[blobUrl] = fresh
    }
    return fresh
  }

  async function createAttachment(
    name: string,
    filename: string,
    size: number,
  ): Promise<AttachmentDto | null> {
    return apiFetch<AttachmentDto>('/attachments', {
      method: 'POST',
      body: { name, filename, size },
    })
  }

  async function uploadFile(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadFileResult> {
    try {
      const attachment = await createAttachment(file.name, file.name, file.size)
      if (!hasApiData(attachment) || !attachment.url) {
        return { ok: false, code: 'unavailable' }
      }

      const pipeline = newPipeline(new AnonymousCredential())
      const blockBlobClient = new BlockBlobClient(attachment.url, pipeline)

      await blockBlobClient.uploadData(file, {
        maxSingleShotSize: 4 * 1024 * 1024,
        onProgress: ({ loadedBytes }) => {
          if (onProgress) {
            onProgress(Math.round((100 * loadedBytes) / file.size))
          }
        },
      })
      return { ok: true }
    }
    catch (error) {
      const message = getApiErrorMessage(error) ?? ''
      if (/file validation failed/i.test(message)) {
        return { ok: false, code: 'tooLarge', message }
      }
      return { ok: false, code: 'unavailable', message }
    }
  }

  async function deleteAttachment(id: string): Promise<boolean> {
    try {
      await apiFetch<null>(`/attachments/${id}`, { method: 'DELETE' })
      return true
    }
    catch {
      return false
    }
  }

  return {
    getValidSasForBlob,
    isSasStillValid,
    createAttachment,
    uploadFile,
    deleteAttachment,
    _sasCache: sasCache,
  }
}
