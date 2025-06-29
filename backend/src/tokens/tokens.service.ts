import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
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
  generateLoginToken(user_id: number) {
    return sign(
      {
        userID: user_id,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      env.JWT_KEY,
      { expiresIn: '6d' },
    );
  }
}
