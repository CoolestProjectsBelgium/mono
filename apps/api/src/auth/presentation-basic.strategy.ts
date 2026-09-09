import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { BasicStrategy as Strategy } from 'passport-http';
import { Account } from '@coolestprojects/database';

/**
 * HTTP Basic auth for Raspberry Pi presentation clients — stateless (no
 * cookie/session), so a device that drops offline for a while just retries
 * the same static `Authorization` header, no re-login flow needed.
 */
@Injectable()
export class PresentationBasicStrategy extends PassportStrategy(Strategy, 'presentation-basic') {
  constructor(
    @InjectModel(Account) private readonly accountModel: typeof Account,
  ) {
    super();
  }

  async validate(userid: string, password: string) {
    const account = await this.accountModel.findOne({
      where: { email: userid, account_type: 'presentation' },
    });

    if (!account) throw new UnauthorizedException();
    if (!account.verifyPassword(password)) throw new UnauthorizedException();

    return { id: account.id, email: account.email };
  }
}
