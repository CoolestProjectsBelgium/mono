import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  id!: string;
  name!: string;
  thumbnailUrl!: string;
}