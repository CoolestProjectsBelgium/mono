import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { SAMLStrategy } from './saml.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [JwtStrategy, SAMLStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
