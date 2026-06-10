import { ApiProperty } from '@nestjs/swagger';

export class SASToken {
    url: string;
    expiresOn: Date;
    startsOn: Date;
}