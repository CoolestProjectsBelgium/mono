import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'process';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model'; // Adjust the import path as per your project structure

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
