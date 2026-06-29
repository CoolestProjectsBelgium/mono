import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from '@coolestprojects/database';

@Injectable()
export class JwtVotingStrategy extends PassportStrategy(Strategy, 'voting') {
  constructor(@InjectModel(Account) private readonly accountModel: typeof Account) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.VOTING_KEY!,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}