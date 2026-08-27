import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from '@coolestprojects/database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtVotingStrategy extends PassportStrategy(Strategy, 'voting') {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("voting.jwt")!,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}