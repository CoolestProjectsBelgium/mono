import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import type { StringValue } from 'ms';

@Injectable()
export class TokensService {
  constructor(private readonly config: ConfigService) {}
  generateRegistrationToken(registration_id: number) {
    return sign(
      {
        registrationID: registration_id,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      this.config.getOrThrow<string>('api.jwt'),
      { expiresIn: this.config.get<StringValue>('api.expires') || '6d' },
    );
  }
  generateLoginToken(user_id: number) {
    return sign(
      {
        userID: user_id,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      this.config.getOrThrow<string>('api.jwt'),
      { expiresIn: this.config.get<StringValue>('api.expires') || '6d' },
    );
  }
}
