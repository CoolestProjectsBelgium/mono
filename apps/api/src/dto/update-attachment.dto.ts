import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttachmentDto {
  @ApiProperty()
  name!: string;
}
