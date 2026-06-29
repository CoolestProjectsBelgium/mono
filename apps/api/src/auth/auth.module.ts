import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtVotingStrategy } from './jwt-voting.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account, User } from '@coolestprojects/database';
import { RegistrationService } from '../registration/registration.service';
import { MailerService } from '../mailer/mailer.service';
import { EmailTemplate } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { TokensService } from '../tokens/tokens.service';
import { Project } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Voucher } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { QuestionUser } from '@coolestprojects/database';
import { QuestionRegistration } from '@coolestprojects/database';

export const VOTING_JWT = Symbol('VOTING_JWT');
export const AUTH_JWT = Symbol('AUTH_JWT');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SequelizeModule.forFeature([User, EmailTemplate, Event, Project, Registration, Voucher, Question, QuestionUser, QuestionRegistration, Account]), // Import User model for JWT validation
  ],
  providers: [{
    provide: AUTH_JWT,
    useFactory: () => new JwtService({
      secret: process.env.JWT_KEY!,
      signOptions: {
        expiresIn: '60m',
      },
    }),
  },
  {
    provide: VOTING_JWT,
    useFactory: () => new JwtService({
      secret: process.env.VOTING_KEY!,
      signOptions: {
        expiresIn: '12h',
      },
    }
    ),
  }, MailerService, TokensService, RegistrationService, JwtStrategy, JwtVotingStrategy], //SAMLStrategy later, needed for admin part
  exports: [AUTH_JWT, VOTING_JWT],
})
export class AuthModule { }
