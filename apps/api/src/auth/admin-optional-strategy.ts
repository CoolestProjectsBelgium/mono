import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-cookie';
import { AdminAuthenticationService } from './adminauth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OptionalAdminCookieStrategy extends PassportStrategy(
  Strategy,
  'optional-admin-cookie',
) {
  constructor(
    private readonly adminAuth: AdminAuthenticationService,
  ) {
    super({
      cookieName: 'adminjs',
      signed: true,
    });
  }

  async validate(token: string) {
    try {
      return await this.adminAuth.validate(token);
    } catch {
      return null;
    }
  }
}
