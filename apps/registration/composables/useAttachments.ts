import {
  AnonymousCredential,
  BlockBlobClient,
  newPipeline,
} from '@azure/storage-blob'
import type { AttachmentDto, SASToken } from '~/types/api'
import { getApiErrorMessage, hasApiData } from '~/utils/api-response'
import { normalizeUploadFile } from '~/utils/attachment-normalize'

type SasCache = Record<string, string>

export type UploadFileCode = 'tooLarge' | 'invalidType' | 'tooMany' | 'unavailable' | 'converting'

export type UploadFileResult =
  | { ok: true; blobId?: string }
  | { ok: false, code: UploadFileCode, message?: string }

const SAS_CACHE_TTL_MS = 2 * 60 * 1000

function blobIdFromSasUrl(url: string): string | undefined {
  const path = new URL(url).pathname
  return path.split('/').pop()
}

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
    const response = await apiFetch<SASToken | null>(`/attachments/${encodeURIComponent(name)}/sas`, {
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
  ): Promise<SASToken | null> {
    return apiFetch<SASToken>('/attachments', {
      method: 'POST',
      body: { name, filename, size },
    })
  }

  async function uploadFile(
    file: File,
    options?: {
      displayName?: string
      onProgress?: (percent: number) => void
      onPhase?: (phase: 'converting' | 'uploading') => void
    },
  ): Promise<UploadFileResult> {
    try {
      options?.onPhase?.('converting')
      const normalized = await normalizeUploadFile(file)
      const displayName = options?.displayName?.trim() || normalized.filename
      options?.onPhase?.('uploading')

      const sasToken = await createAttachment(
        displayName,
        normalized.filename,
        normalized.file.size,
      )
      if (!hasApiData(sasToken) || !sasToken.url) {
        return { ok: false, code: 'unavailable' }
      }

      const pipeline = newPipeline(new AnonymousCredential())
      const blockBlobClient = new BlockBlobClient(sasToken.url, pipeline)

      await blockBlobClient.uploadData(normalized.file, {
        maxSingleShotSize: 4 * 1024 * 1024,
        onProgress: ({ loadedBytes }) => {
          if (options?.onProgress) {
            options.onProgress(Math.round((100 * loadedBytes) / normalized.file.size))
          }
        },
      })

      const blobId = blobIdFromSasUrl(sasToken.url)
      if (blobId && normalized.needsServerNormalize) {
        await apiFetch<null>(`/attachments/${encodeURIComponent(blobId)}/normalize`, {
          method: 'POST',
        })
      }
      if (blobId && normalized.filename.endsWith('.mp4')) {
        await apiFetch<null>(`/attachments/${encodeURIComponent(blobId)}/poster`, {
          method: 'POST',
        }).catch(() => undefined)
      }

      return { ok: true, blobId }
    }
    catch (error) {
      const message = getApiErrorMessage(error) ?? ''
      if (/invalidtype/i.test(message) || message === 'invalidType') {
        return { ok: false, code: 'invalidType', message }
      }
      if (/file validation failed/i.test(message)) {
        return { ok: false, code: 'tooLarge', message }
      }
      if (/maximum number of attachments/i.test(message)) {
        return { ok: false, code: 'tooMany', message }
      }
      return { ok: false, code: 'unavailable', message }
    }
  }

  async function deleteAttachment(id: string): Promise<boolean> {
    try {
      await apiFetch<null>(`/attachments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      return true
    }
    catch {
      return false
    }
  }

  async function renameAttachment(id: string, name: string): Promise<boolean> {
    try {
      await apiFetch<null>(`/attachments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { name },
      })
      return true
    }
    catch {
      return false
    }
  }

  async function getDownloadUrl(attachment: AttachmentDto): Promise<string | null> {
    if (!attachment.exists) {
      return null
    }
    if (attachment.url) {
      return attachment.url
    }
    const baseUrl = `https://blob.local/${attachment.id}`
    const sas = await getValidSasForBlob(baseUrl)
    return sas ? `${baseUrl.split('?')[0]}${sas}` : null
  }

  return {
    getValidSasForBlob,
    isSasStillValid,
    createAttachment,
    uploadFile,
    deleteAttachment,
    renameAttachment,
    getDownloadUrl,
    _sasCache: sasCache,
  }
}
