import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ParticipantDto } from './participant.dto';
import { AttachmentDto } from './attachment.dto';

export class OwnProjectDto {
  // Response-only fields (project_id, participants, attachments, ...) are
  // deliberately left unvalidated: clients echo them back on update.
  project_id?: string;

  @IsString()
  @IsNotEmpty()
  project_name!: string;

  @IsString()
  @IsNotEmpty()
  project_descr!: string;

  @IsString()
  @IsNotEmpty()
  project_type!: string;

  @ApiProperty({ enum: ['nl', 'fr', 'en'] })
  @IsIn(['nl', 'fr', 'en'])
  project_lang!: string;

  participants?: ParticipantDto[];
  attachments?: AttachmentDto[];
  delete_possible?: boolean;
  is_owner?: boolean;
}
