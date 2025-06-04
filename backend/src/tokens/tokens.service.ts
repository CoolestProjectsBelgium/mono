import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { env } from 'process';

@Injectable()
export class TokensService {
  constructor() {}
  generateRegistrationToken(registration_id: number) {
    return sign(
      {
        registrationID: registration_id,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      env.JWT_KEY,
      { expiresIn: '6d' },
    );
  }
  verifyRegistrationToken(token: string): { registrationID: number } {
    try {
      return verify(token, env.JWT_KEY) as { registrationID: number };
    } catch (error) {
      throw new Error('Invalid token:', error);
    }
  }
}
