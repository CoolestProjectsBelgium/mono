import { ApiProperty } from '@nestjs/swagger';

export class EventguideEventDto {
  id!: number;
  title!: string;
  officialStartDate!: string;
  floorplanPath!: string;
  /** File mtime (ms) used to bust browser caches after admin re-uploads. */
  floorplanVersion!: string | null;
}

export class EventguideProjectDto {
  id!: number;
  name!: string;
  description!: string;
  @ApiProperty({ enum: ['nl', 'fr', 'en'] })
  language!: string;
  tableNumber!: number | null;
  tableName!: string | null;
  participants!: string[];
  agreedToPhoto!: boolean;
  thumbnailUrl!: string | null;
}

export class EventguideProjectsResponseDto {
  event!: EventguideEventDto;
  projects!: EventguideProjectDto[];
}
