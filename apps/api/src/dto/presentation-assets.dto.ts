export class PresentationAssetListItemDto {
  filename!: string;
  uploadedAt!: string;
}

export class PresentationAssetsOverviewDto {
  assets!: PresentationAssetListItemDto[];
}

export class UploadPresentationAssetDto {
  /** Base64-encoded image bytes (png/jpg/jpeg/webp/svg/gif). */
  imageContentBase64!: string;
  originalName!: string;
}
