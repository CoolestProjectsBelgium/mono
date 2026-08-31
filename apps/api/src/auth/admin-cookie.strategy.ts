import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-cookie';
import { AdminAuthenticationService } from './adminauth.service';

@Injectable()
export class AdminCookieStrategy extends PassportStrategy(
  Strategy,
  'mandatory-admin-cookie',
) {
  constructor(
    private readonly adminAuth: AdminAuthenticationService,
  ) {
    super({
      cookieName: 'adminjs',
      signed: true,
    });
  }

  validate(token: string) {
    return this.adminAuth.validate(token);
  }
}