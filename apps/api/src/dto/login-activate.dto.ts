import { IsNotEmpty, IsString } from 'class-validator';

export class LoginActivateDto {
  @IsString()
  @IsNotEmpty()
  jwt!: string;
}
