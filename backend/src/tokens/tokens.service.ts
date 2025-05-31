import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { env } from 'process';

@Injectable()
export class TokensService {
  constructor() {}
  generateRegistrationToken(registration_id: number) {
    return sign({ registrationID: registration_id }, env.JWT_KEY);;
  }
}
