export class UploadPresentationSlideImageDto {
  /** Base64-encoded image bytes (png/jpg/jpeg/webp). */
  imageContentBase64!: string;
  originalName!: string;
}
