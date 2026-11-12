import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { OwnProjectDto } from './own-project.dto';
import { OtherProjectDto } from './other-project.dto';

export class ProjectDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OwnProjectDto)
  own_project?: OwnProjectDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OtherProjectDto)
  other_project?: OtherProjectDto;
}
