import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParticipantDto {
    id!: number;
    name!: string;
    self!: boolean;
    @ApiPropertyOptional()
    is_owner?: boolean;
    @ApiPropertyOptional({ enum: ['registered', 'pending'] })
    status?: 'registered' | 'pending';
    @ApiPropertyOptional()
    token?: string;
    delete_possible?: boolean;
}
