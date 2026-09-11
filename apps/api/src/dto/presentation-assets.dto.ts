export class PresentationAssetListItemDto {
  filename!: string;
  uploadedAt!: string;
}

export class PresentationAssetsOverviewDto {
  assets!: PresentationAssetListItemDto[];
}
