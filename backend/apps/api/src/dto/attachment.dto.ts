import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  id: string;
  name: string;
  filename: string;
  size: number;
  confirmed: boolean;
  exists: boolean;
  @ApiProperty({ enum: ['link', 'movie']})
  type: string;
}