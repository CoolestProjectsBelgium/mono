import { IsEmail, MaxLength } from 'class-validator';

export class LoginMailDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
