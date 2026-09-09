import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from '@coolestprojects/database';

@Injectable()
export class JwtVotingStrategy extends PassportStrategy(Strategy, 'jwt-voting') {
  constructor(
    private configService: ConfigService,
    @InjectModel(Account) private readonly accountModel: typeof Account,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow("voting.jwt"),
    });
  }

  async validate(payload: any) {
    // The JWT itself only proves it was validly signed; it stays valid for its
    // full 12h lifetime even if the jury account is deleted or demoted after
    // issuance. Re-check against the DB on every request so a revoked account
    // loses access immediately instead of at token expiry.
    const account = await this.accountModel.findOne({
      where: { id: payload.id, account_type: 'jury' },
    });

    if (!account) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
