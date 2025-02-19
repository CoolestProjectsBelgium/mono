import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensService {
  constructor() {}
  async generateRegistrationToken(registration_id: number) {
    return 'registration';
  }
}
