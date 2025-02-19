import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    api_key: string;
    expires: Date;
    @ApiProperty({ enum: ['nl', 'fr', 'en']})
    language: string;
}