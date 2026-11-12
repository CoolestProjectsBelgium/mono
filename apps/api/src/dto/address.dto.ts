import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  street!: string;

  @IsOptional()
  @IsString()
  house_number!: string;

  @IsString()
  municipality_name!: string;

  @IsOptional()
  @IsString()
  box_number!: string;

  // 0 = unknown (legacy profiles); real codes are checked against the
  // event's municipality list by the services.
  @IsInt()
  @Min(0)
  @Max(9999)
  postalcode!: number;
}
