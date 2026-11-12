import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class OtherProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  project_code!: string;
}
