import { ApiProperty } from '@nestjs/swagger';
import { ParticipantDto } from './participant.dto';
import { AttachmentDto } from './attachment.dto';

export class OwnProjectDto {
  project_id: string;
  project_name: string;
  project_descr: string;
  project_type: string;
  @ApiProperty({ enum: ['nl', 'fr', 'en']})
  project_lang: string;
  participants: ParticipantDto[];
  attachments: AttachmentDto[];
  delete_possible: boolean;
}