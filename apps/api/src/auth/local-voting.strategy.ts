import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Account } from '@coolestprojects/database';

@Injectable()
export class VotingLoginStrategy extends PassportStrategy(Strategy, 'voting_login') {
  constructor(private accountModel: typeof Account) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(username: string, password: string) {
    const account = await this.accountModel.findOne({
      where: { email: username, account_type: 'jury' },
    });

    if (!account) throw new UnauthorizedException();
    if (!account.verifyPassword(password)) throw new UnauthorizedException();

    return { id: account.id, email: account.email, user: account.email };
  }
}