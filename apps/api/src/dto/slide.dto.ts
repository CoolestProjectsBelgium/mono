export class SlideSummaryDto {
  key!: string;
  order!: number;
  time!: number;
  hash!: string;
  generatedAt!: string | null;
}

export class SlideListResponseDto {
  slides!: SlideSummaryDto[];
  hash!: string;
}

export class PresentationResolutionDto {
  key!: string;
  width!: number;
  height!: number;
}

export class PresentationResolutionsResponseDto {
  resolutions!: PresentationResolutionDto[];
  default!: string;
}
