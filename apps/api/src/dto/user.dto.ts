import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { AddressDto } from './address.dto';

/** Question ids arrive as strings from the SPA and as numbers from older clients. */
function IsQuestionIdArray(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isQuestionIdArray',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be an array of question ids`,
        ...options,
      },
      validator: {
        validate: (value: unknown) =>
          Array.isArray(value) &&
          value.every(
            (id) =>
              (typeof id === 'number' || typeof id === 'string') &&
              id !== '' &&
              Number.isInteger(Number(id)),
          ),
      },
    });
}

const isFilled = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

export class UserDto {
  id?: number;

  @ApiProperty({ enum: ['nl', 'fr', 'en'] })
  @IsIn(['nl', 'fr', 'en'])
  language!: string;

  // Ignored on profile updates (the email is the login identity), so only
  // checked when present.
  @ValidateIf((dto: UserDto) => isFilled(dto.email))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @IsString()
  @IsNotEmpty()
  lastname!: string;

  @ApiProperty({ enum: ['m', 'f', 'x'] })
  @IsIn(['m', 'f', 'x'])
  sex!: string;

  @IsOptional()
  @IsString()
  gsm!: string;

  @IsOptional()
  @IsArray()
  @IsQuestionIdArray()
  general_questions!: string[];

  @IsOptional()
  @IsArray()
  @IsQuestionIdArray()
  mandatory_approvals!: string[];

  @IsOptional()
  @IsInt()
  year!: number;

  @IsOptional()
  @IsInt()
  month!: number;

  @IsInt()
  t_size!: number;

  @IsOptional()
  @IsString()
  gsm_guardian!: string;

  // Empty string means "no guardian" (stored as null by the services).
  @ValidateIf((dto: UserDto) => isFilled(dto.email_guardian))
  @IsEmail()
  @MaxLength(254)
  email_guardian!: string;

  @IsOptional()
  @IsString()
  via!: string;

  @ApiProperty({ enum: ['dojo', 'other', ''], required: false })
  @IsOptional()
  @IsIn(['dojo', 'other', ''])
  via_type!: 'dojo' | 'other' | '';

  @IsOptional()
  @IsString()
  medical!: string;

  delete_possible?: boolean;

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
