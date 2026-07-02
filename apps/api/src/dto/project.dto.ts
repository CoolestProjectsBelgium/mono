import { OwnProjectDto } from './own-project.dto';
import { OtherProjectDto } from './other-project.dto';
import { AttachmentDto } from './attachment.dto';

export class ProjectDto {
  is_owner?: boolean;
  own_project?: OwnProjectDto;
  other_project?: OtherProjectDto;
  attachments?: AttachmentDto[];
}
