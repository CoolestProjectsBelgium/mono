import { Strategy } from 'passport-saml';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SAMLStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
        cert: '',
    });
  }

  async validate(profile: any, done: Function) {
    try {
      return done(new UnauthorizedException(), false);
    } catch (error) {
      return done(error, false);
    }
  }
}