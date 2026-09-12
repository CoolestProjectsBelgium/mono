import {
  Account,
  AdminSession,
  Affiliation,
  Attachment,
  Award,
  Certificate,
  CertificateRender,
  CertificateTemplate,
  EmailTemplate,
  Event,
  EventTable,
  Message,
  PresentationRender,
  PresentationSlide,
  Project,
  Question,
  QuestionRegistration,
  QuestionTranslation,
  QuestionUser,
  Registration,
  Tshirt,
  TshirtGroup,
  TshirtGroupTranslation,
  TshirtTranslation,
  User,
  UserProject,
  Vote,
  VoteCategory,
} from '@coolestprojects/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BackgroundService } from './background/background.service';
import { CertificateController } from './certificate/certificate.controller';
import { CertificateService } from './certificate/certificate.service';
import { EventService } from './event/event.service';
import { EventguideController } from './eventguide/eventguide.controller';
import { EventguideService } from './eventguide/eventguide.service';
import { FileUploadService } from './file-upload/file-upload.service';
import { InfoInterceptor } from './info.interceptor';
import { LoginController } from './login/login.controller';
import { MailerService } from './mailer/mailer.service';
import { ParticipantController } from './participant/participant.controller';
import { ParticipantService } from './participant/participant.service';
import { PresentationController } from './presentation/presentation.controller';
import { PresentationService } from './presentation/presentation.service';
import { ProjectinfoController } from './projectinfo/projectinfo.controller';
import { ProjectinfoService } from './projectinfo/projectinfo.service';
import { RegistrationController } from './registration/registration.controller';
import { RegistrationService } from './registration/registration.service';
import { TokensService } from './tokens/tokens.service';
import { UserinfoController } from './userinfo/userinfo.controller';
import { UserinfoService } from './userinfo/userinfo.service';
import { UserCookieInterceptor } from './user-cookie.interceptor';
import { VotingController } from './voting/voting.controller';
import { VotingService } from './voting/voting.service';
import { EmailLog } from '@coolestprojects/database';
import { AdminAuthenticationService } from './auth/adminauth.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

import configuration from './config/configuration.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Not bound globally (via APP_GUARD): event-day traffic legitimately comes
    // from many participants behind one shared venue/school NAT, so a blanket
    // per-IP limit would risk locking out a whole room. Applied per-route with
    // @UseGuards(ThrottlerGuard) + @Throttle(...) only on the endpoints the
    // security assessment flagged as brute-force/abuse targets (login,
    // magic-link, voting login) — see docs/security-assessment-2026-09.md H1.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    AuthModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: configService.get('database.dialect'),
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.user'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          synchronize: configService.get('database.synchronize'),
          sync: configService.get('database.sync'),
          autoLoadModels: true,
          models: [
            Event,
            User,
            Registration,
            Tshirt,
            Question,
            QuestionUser,
            QuestionRegistration,
            Project,
            TshirtGroup,
            TshirtGroupTranslation,
            TshirtTranslation,
            QuestionTranslation,
            EventTable,
            Attachment,
            Certificate,
            Message,
            Vote,
            VoteCategory,
            Account,
            AdminSession,
            Award,
            EmailTemplate,
            UserProject,
            EmailLog,
            Affiliation,
            PresentationSlide,
            PresentationRender,
            CertificateTemplate,
            CertificateRender,
          ],
        };
      },
    }),
    SequelizeModule.forFeature([
      TshirtGroup,
      Question,
      Event,
      Registration,
      User,
      Project,
      UserProject,
      QuestionRegistration,
      EmailTemplate,
      Account,
      AdminSession,
      QuestionUser,
      QuestionTranslation,
      Tshirt,
      TshirtTranslation,
      TshirtGroupTranslation,
      EventTable,
      Vote,
      VoteCategory,
      Award,
      Attachment,
      EmailLog,
      Affiliation,
      PresentationSlide,
      PresentationRender,
      Certificate,
      CertificateTemplate,
      CertificateRender,
    ]),
  ],
  controllers: [
    AppController,
    RegistrationController,
    ProjectinfoController,
    UserinfoController,
    ParticipantController,
    LoginController,
    VotingController,
    EventguideController,
    PresentationController,
    AdminController,
    CertificateController,
  ],
  providers: [
    { provide: 'APP_INTERCEPTOR', useClass: InfoInterceptor },
    AppService,
    RegistrationService,
    MailerService,
    FileUploadService,
    TokensService,
    BackgroundService,
    EventService,
    ParticipantService,
    ProjectinfoService,
    VotingService,
    PresentationService,
    EventguideService,
    UserinfoService,
    UserCookieInterceptor,
    AdminAuthenticationService,
    AdminService,
    CertificateService,
  ],
  exports: [],
})
export class AppModule {}
