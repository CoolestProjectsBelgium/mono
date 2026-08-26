import type { AttachmentDto } from '~/types/api'
import { getApiErrorMessage } from '~/utils/api-response'
import {
  buildAttachmentThumbnailPath,
  fetchAttachmentThumbnailObjectUrl,
  revokeAttachmentThumbnailObjectUrl,
} from '~/utils/attachment-thumbnail'
import { normalizeUploadFile } from '~/utils/attachment-normalize'
import { ensureCsrfToken } from '~/utils/csrf-token'
export type UploadFileCode = 'tooLarge' | 'invalidType' | 'tooMany' | 'unavailable' | 'converting'

export type UploadFileResult =
  | { ok: true }
  | { ok: false, code: UploadFileCode, message?: string }

export function useAttachments() {
  const { apiFetch, apiBase } = useApiClient()

  async function fetchAttachments(): Promise<AttachmentDto[]> {
    const response = await apiFetch<AttachmentDto[]>('/projectinfo/attachments')
    return response ?? []
  }

  async function uploadFile(
    file: File,
    options?: {
      onProgress?: (percent: number) => void
      onPhase?: (phase: 'converting' | 'uploading') => void
    },
  ): Promise<UploadFileResult> {
    try {
      options?.onPhase?.('converting')
      const normalized = await normalizeUploadFile(file)
      options?.onPhase?.('uploading')

      const formData = new FormData()
      formData.append('file', normalized.file, normalized.filename)

      const csrfToken = await ensureCsrfToken(apiBase)
      const url = `${apiBase.replace(/\/$/, '')}/projectinfo/attachments`

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url)
        xhr.withCredentials = true
        xhr.setRequestHeader('x-csrf-token', csrfToken)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options?.onProgress) {
            options.onProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
            return
          }
          reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`))
        }

        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.send(formData)
      })

      return { ok: true }
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
      await apiFetch<null>(`/projectinfo/attachments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      revokeAttachmentThumbnailObjectUrl(id)
      return true
    }
    catch {
      return false
    }
  }

  async function fetchThumbnailObjectUrl(attachmentId: string): Promise<string | null> {
    return fetchAttachmentThumbnailObjectUrl(apiBase, attachmentId)
  }

  function getPreviewUrl(attachment: AttachmentDto): string | null {
    if (!attachment.id) {
      return null
    }
    const baseURL = apiBase.replace(/\/$/, '')
    return `${baseURL}${buildAttachmentThumbnailPath(attachment.id)}`
  }

  return {
    fetchAttachments,
    uploadFile,
    deleteAttachment,
    fetchThumbnailObjectUrl,
    getPreviewUrl,
  }
}