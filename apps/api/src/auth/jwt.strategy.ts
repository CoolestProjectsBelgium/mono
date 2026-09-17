import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { User } from '@coolestprojects/database';
import { RegistrationService } from '../registration/registration.service';

/**
 * passport-jwt has no built-in cookie extractor (only header/body/query
 * ones) — this reads the signed `jwt` cookie set on login/registration
 * activation (see cookie-options.ts's `buildAppCookieOptions`, `signed:
 * true`). Nothing in this codebase sends the token as an Authorization
 * header for this guard, so there's no fallback to preserve.
 */
function fromSignedCookie(req: Request): string | null {
  return (req.signedCookies?.jwt as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly registrationService: RegistrationService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: fromSignedCookie,
      secretOrKey: configService.getOrThrow<string>('api.jwt'),
      // Tokens are always signed HS256 (tokens.service.ts's `sign()` calls
      // pass no `algorithm`, which defaults to HS256) — restrict verification
      // to match explicitly rather than relying on jsonwebtoken's default
      // algorithm inference.
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    // we need to activiate the registrationID
    let user: User | null = null;
    if (payload.registrationID) {
      user = await this.registrationService.activateRegistration(
        payload.registrationID,
      );
    }

    if (payload.userID) {
      user = await this.userModel.findByPk(payload.userID);
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
