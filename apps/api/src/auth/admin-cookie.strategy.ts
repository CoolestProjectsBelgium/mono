import { Account, AdminSession } from '@coolestprojects/database';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { signedCookie } from 'cookie-parser';
import { Strategy } from 'passport-cookie';
import { env } from 'process';
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
    const sessionId = signedCookie(token, env.ADMINJS_COOKIE_SECRET);

    if (!sessionId || sessionId === false) {
      throw new UnauthorizedException();
    }

    const session = await this.adminSessionModel.findByPk(sessionId);
    if (!session || session.expires <= new Date()) {
      throw new UnauthorizedException();
    }

    const sessionData = JSON.parse(session.data) as {
      adminUser?: { email?: string, eventId?: number, role?: string };
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
  }
}
