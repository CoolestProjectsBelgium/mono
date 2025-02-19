import { OwnProjectDto } from './own-project.dto';
import { OtherProjectDto } from './other-project.dto';
import { AttachmentDto } from './attachment.dto';

export class ProjectDto {
  own_project: OwnProjectDto;
  other_project: OtherProjectDto;
  attachments: AttachmentDto[];
}