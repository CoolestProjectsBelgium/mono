import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParticipantDto {
  id!: number;
  name!: string;
  self!: boolean;
  @ApiPropertyOptional()
  is_owner?: boolean;
  @ApiProperty({ enum: ['registered', 'pending'] })
  status!: 'registered' | 'pending';
  @ApiPropertyOptional()
  token?: string;
}
