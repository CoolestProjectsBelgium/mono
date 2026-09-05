export class FloorplanListItemDto {
  filename!: string;
  uploadedAt!: string;
  isActive!: boolean;
}

export class FloorplansOverviewDto {
  floorplans!: FloorplanListItemDto[];
  activeFilename!: string | null;
}

export class UploadFloorplanDto {
  svgContent!: string;
  originalName!: string;
}
