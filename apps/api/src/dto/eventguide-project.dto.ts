import { ApiProperty } from '@nestjs/swagger';

export class EventguideEventDto {
  id!: number;
  title!: string;
  officialStartDate!: string;
  floorplanPath!: string;
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
