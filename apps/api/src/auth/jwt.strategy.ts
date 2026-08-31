import { Strategy } from 'passport-jwt-cookiecombo';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'process';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { RegistrationService } from '../registration/registration.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly registrationService: RegistrationService,
  ) {
    super({
      secretOrPublicKey: env.JWT_KEY,
    });
  }

  async validate(payload: any) {
    // we need to activiate the registrationID
    let user : User | null = null;
    if(payload.registrationID) {
      user = await this.registrationService.activateRegistration(payload.registrationID);
    }

    if(payload.userID){
      user = await this.userModel.findByPk(payload.userID);
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
