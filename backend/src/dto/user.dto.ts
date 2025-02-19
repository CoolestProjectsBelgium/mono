import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';

export class UserDto {
  id: number;
  @ApiProperty({ enum: ['nl', 'fr', 'en'] })
  language: string;
  email: string;
  firstname: string;
  lastname: string;
  @ApiProperty({ enum: ['m', 'f', 'x'] })
  sex: string;
  gsm: string;
  general_questions: string[];
  mandatory_approvals: string[];
  year: number;
  month: number;
  t_size: number;
  gsm_guardian: string;
  email_guardian: string;
  via: string;
  medical: string;
  delete_possible: boolean;
  address: AddressDto;
}
