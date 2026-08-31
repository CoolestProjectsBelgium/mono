import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Account, Event } from '@coolestprojects/database';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class VotingLoginStrategy extends PassportStrategy(Strategy, 'login-voting') {
  constructor(private accountModel: typeof Account, private eventModel: typeof Event) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(username: string, password: string) {
    const account = await this.accountModel.findOne({
      where: { email: username, account_type: 'jury' },
    });

    if (!account) throw new UnauthorizedException();
    if (!account.verifyPassword(password)) throw new UnauthorizedException();

    const activeEvent = await this.eventModel.findOne({
      where: {
        eventBeginDate: { [Op.lt]: Sequelize.literal('CURDATE()') },
        eventEndDate: { [Op.gt]: Sequelize.literal('CURDATE()') },
      },
      attributes: ['id'],
    });

    if(!activeEvent){
      throw new UnauthorizedException();
    }

    return { id: account.id, email: account.email, user: account.email, eventId: activeEvent.id };
  }
}