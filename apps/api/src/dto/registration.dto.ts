import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { UserDto } from './user.dto';
import { ProjectDto } from './project.dto';

export class RegistrationDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UserDto)
  user!: UserDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => ProjectDto)
  project!: ProjectDto;
}
