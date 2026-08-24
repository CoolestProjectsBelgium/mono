import { Strategy } from 'passport-cookie';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'process';
import { createHmac, timingSafeEqual } from 'crypto';
import { InjectModel } from '@nestjs/sequelize';
import { Account, AdminSession } from '@coolestprojects/database';
import { Op } from 'sequelize';

@Injectable()
export class AdminCookieStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(AdminSession)
    private readonly adminSessionModel: typeof AdminSession,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {
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

      const session = await this.adminSessionModel.findByPk(sessionId);
      if (!session || session.expires <= new Date()) {
        throw new UnauthorizedException();
      }

      const sessionData = JSON.parse(session.data) as {
        adminUser?: { email?: string };
      };
      const email = sessionData.adminUser?.email;
      if (!email) {
        throw new UnauthorizedException();
      }

      const account = await this.accountModel.findOne({
        where: {
          email,
          account_type: {
            [Op.in]: ['super_admin', 'admin'],
          },
        },
      });
      if (!account) {
        throw new UnauthorizedException();
      }

      return done(null, { ...account.get({ plain: true }), isAdmin: true }); //TODO check eventID when api's are called
    } catch {
      return done(new UnauthorizedException(), false);
    }
  }
}
