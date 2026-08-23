import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'process';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class AdminCookieStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      cookieName: 'adminjs',
    });
  }

  async validate(req: any, token: string, done: any) {
    try {
      const secret = env.ADMINJS_COOKIE_SECRET;
      if (!secret) {
        throw new UnauthorizedException();
      }

      if (!token.startsWith('s:')) {
        throw new UnauthorizedException();
      }

      const signedValue = token.slice(2);
      const separator = signedValue.lastIndexOf('.');
      if (separator <= 0 || separator === signedValue.length - 1) {
        throw new UnauthorizedException();
      }

      const sessionId = signedValue.slice(0, separator);
      const signature = signedValue.slice(separator + 1);
      const expectedSignature = createHmac('sha256', secret)
        .update(sessionId)
        .digest('base64')
        .replace(/=+$/, '');
      const expected = Buffer.from(expectedSignature);
      const actual = Buffer.from(signature);

      if (
        expected.length !== actual.length ||
        !timingSafeEqual(expected, actual)
      ) {
        throw new UnauthorizedException();
      }

      return done(null, { isAdmin: true });
    } catch {
      return done(new UnauthorizedException(), false);
    }
  }
}
