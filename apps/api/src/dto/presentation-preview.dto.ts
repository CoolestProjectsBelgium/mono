export class PreviewPresentationSlideDraftDto {
  slideId!: number;
  body!: string;
  projectId?: number;
}

export class PreviewPresentationSlideDraftResponseDto {
  imageBase64!: string;
}

export class VisibleProjectOptionDto {
  id!: number;
  name!: string;
}
