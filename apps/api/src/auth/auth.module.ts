import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtVotingStrategy } from './jwt-voting.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account, AdminSession, Affiliation, User, EmailLog } from '@coolestprojects/database';
import { RegistrationService } from '../registration/registration.service';
import { MailerService } from '../mailer/mailer.service';
import { EmailTemplate } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { UserProject } from '@coolestprojects/database';
import { TokensService } from '../tokens/tokens.service';
import { Project } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { QuestionUser } from '@coolestprojects/database';
import { QuestionRegistration } from '@coolestprojects/database';
import { AdminCookieStrategy } from './admin-cookie.strategy';
import { OptionalAdminCookieStrategy } from './admin-optional-strategy';
import { AdminAuthenticationService } from './adminauth.service';
import { VotingLoginStrategy } from './local-voting.strategy';

export const VOTING_JWT = Symbol('VOTING_JWT');
export const AUTH_JWT = Symbol('AUTH_JWT');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SequelizeModule.forFeature([User, EmailTemplate, Event, Project, Registration, Question, QuestionUser, QuestionRegistration, Account, AdminSession, UserProject, EmailLog, Affiliation]),
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
  }, MailerService, TokensService, RegistrationService, JwtStrategy, JwtVotingStrategy, VotingLoginStrategy, AdminCookieStrategy, OptionalAdminCookieStrategy, AdminAuthenticationService],
  exports: [AUTH_JWT, VOTING_JWT],
})
export class AuthModule { }
