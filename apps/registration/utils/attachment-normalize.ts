import { getFileExtension } from './attachment-media'

export type UploadFileClass =
  | 'native'
  | 'convertible-image'
  | 'convertible-video'
  | 'rejected'

export type NormalizedUpload = {
  file: File
  filename: string
  needsServerNormalize: boolean
}

const NATIVE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'mp4'])
const CONVERTIBLE_IMAGE_EXTENSIONS = new Set(['webp', 'bmp', 'tiff', 'gif', 'heic', 'heif'])
const CONVERTIBLE_VIDEO_EXTENSIONS = new Set(['mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'])

export function classifyUploadFile(file: File): UploadFileClass {
  const mime = file.type.toLowerCase()
  const ext = getFileExtension(file.name)

  if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
    return 'rejected'
  }

  if (NATIVE_EXTENSIONS.has(ext)) {
    return 'native'
  }
  if (CONVERTIBLE_IMAGE_EXTENSIONS.has(ext) || mime.startsWith('image/')) {
    return 'convertible-image'
  }
  if (CONVERTIBLE_VIDEO_EXTENSIONS.has(ext) || mime.startsWith('video/')) {
    return 'convertible-video'
  }
  return 'rejected'
}

function replaceExtension(filename: string, nextExt: string): string {
  const base = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename
  return `${base}.${nextExt}`
}

async function convertImageWithCanvas(file: File, targetExt: 'jpg' | 'png'): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas unavailable')
  }
  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  const mimeType = targetExt === 'png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('Image conversion failed'))
        return
      }
      resolve(result)
    }, mimeType, 0.92)
  })

  const filename = replaceExtension(file.name, targetExt)
  return new File([blob], filename, { type: mimeType })
}

async function convertHeicImage(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({ blob: file, toType: 'image/jpeg' })
  const blob = Array.isArray(converted) ? converted[0] : converted
  const filename = replaceExtension(file.name, 'jpg')
  return new File([blob], filename, { type: 'image/jpeg' })
}

export async function normalizeUploadFile(file: File): Promise<NormalizedUpload> {
  const uploadClass = classifyUploadFile(file)

  if (uploadClass === 'rejected') {
    throw new Error('invalidType')
  }

  if (uploadClass === 'native') {
    return { file, filename: file.name, needsServerNormalize: false }
  }

  if (uploadClass === 'convertible-video') {
    return {
      file,
      filename: replaceExtension(file.name, 'mp4'),
      needsServerNormalize: true,
    }
  }

  const ext = getFileExtension(file.name)
  const converted = ext === 'heic' || ext === 'heif'
    ? await convertHeicImage(file)
    : await convertImageWithCanvas(file, 'jpg')

  return {
    file: converted,
    filename: converted.name,
    needsServerNormalize: false,
  }
}
