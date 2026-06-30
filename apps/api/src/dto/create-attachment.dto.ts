import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  filename!: string;

  @ApiProperty()
  size!: number;
}
