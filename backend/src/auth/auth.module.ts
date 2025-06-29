import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { SAMLStrategy } from './saml.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { RegistrationService } from '../registration/registration.service';
import { MailerService } from '../mailer/mailer.service';
import { EmailTemplate } from '../models/email_template.model';
import { Event } from '../models/event.model';
import { TokensService } from '../tokens/tokens.service';
import { Project } from '../models/project.model';
import { Registration } from '../models/registration.model';
import { Voucher } from '../models/voucher.model';
import { Question } from '../models/question.model';
import { QuestionUser } from '../models/question_user.model';
import { QuestionRegistration } from '../models/question_registration.model';

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
