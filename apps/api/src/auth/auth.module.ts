import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
//import { SAMLStrategy } from './saml.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_KEY,
      signOptions: { expiresIn: '60s' },
    }),
    SequelizeModule.forFeature([User, EmailTemplate, Event, Project, Registration, Voucher, Question, QuestionUser, QuestionRegistration]), // Import User model for JWT validation
  ],
  providers: [ MailerService, TokensService, RegistrationService, JwtStrategy], //SAMLStrategy later, needed for admin part
  exports: [],
})
export class AuthModule {}
