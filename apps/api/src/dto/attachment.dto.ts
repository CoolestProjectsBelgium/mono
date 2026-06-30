import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  url?: string | null;

  @ApiProperty()
  filename!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty()
  confirmed!: boolean;

  @ApiProperty()
  exists!: boolean;

  @ApiProperty({ enum: ['link', 'movie'] })
  type!: string;
}
