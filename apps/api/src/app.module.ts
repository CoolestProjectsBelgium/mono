import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationService } from './registration/registration.service';
import { RegistrationController } from './registration/registration.controller';
import { ProjectinfoController } from './projectinfo/projectinfo.controller';
import { UserinfoController } from './userinfo/userinfo.controller';
import { UserinfoService } from './userinfo/userinfo.service';
import { AttachmentController } from './attachment/attachment.controller';
import { AttachmentService } from './attachment/attachment.service';
import { ParticipantController } from './participant/participant.controller';
import { LoginController } from './login/login.controller';
import { MailerService } from './mailer/mailer.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { Tshirt } from '@coolestprojects/database';
import { EventTable } from '@coolestprojects/database';
import { ProjectTable } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { QuestionUser } from '@coolestprojects/database';
import { QuestionRegistration } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
import { Location } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { TshirtGroup } from '@coolestprojects/database';
import { TshirtGroupTranslation } from '@coolestprojects/database';
import { TshirtTranslation } from '@coolestprojects/database';
import { QuestionTranslation } from '@coolestprojects/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokensService } from './tokens/tokens.service';
import { Voucher } from '@coolestprojects/database';
import { AzureBlob } from '@coolestprojects/database';
import { Attachment } from '@coolestprojects/database';
import { Hyperlink } from '@coolestprojects/database';
import { Certificate } from '@coolestprojects/database';
import { Message } from '@coolestprojects/database';
import { Vote } from '@coolestprojects/database';
import { VoteCategory } from '@coolestprojects/database';
import { Account } from '@coolestprojects/database';
import { Award } from '@coolestprojects/database';
import { ScheduleModule } from '@nestjs/schedule';
import { BackgroundService } from './background/background.service';
import { EventService } from './event/event.service';
import { EmailTemplate } from '@coolestprojects/database';
import { ParticipantService } from './participant/participant.service';
import { ProjectinfoService } from './projectinfo/projectinfo.service';
import { InfoInterceptor } from './info.interceptor';
import { AuthModule } from './auth/auth.module';
import { VotingController } from './voting/voting.controller';
import { VotingService } from './voting/voting.service';
import { AzureBlobService } from './azureblob/azureblob.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
    }),
    AuthModule,
    //AdminModule.register(1),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: configService.get('DB_DIALECT'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          synchronize: true,
          autoLoadModels: true,
          //sync: { force: true },
          models: [
            Event,
            User,
            Registration,
            Tshirt,
            Question,
            QuestionUser,
            QuestionRegistration,
            Project,
            Location,
            TshirtGroup,
            TshirtGroupTranslation,
            TshirtTranslation,
            QuestionTranslation,
            EventTable,
            ProjectTable,
            Voucher,
            AzureBlob,
            Attachment,
            Hyperlink,
            Certificate,
            Message,
            Vote,
            VoteCategory,
            Account,
            Award,
            EmailTemplate
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
      QuestionRegistration,
      EmailTemplate,
      Account,
      Voucher,
      QuestionUser,
      QuestionTranslation,
      Tshirt,
      TshirtTranslation,
      TshirtGroupTranslation,
      Location,
      EventTable,
      ProjectTable,
      Attachment,
      AzureBlob,
      Vote,
      VoteCategory
    ]),
  ],
  controllers: [
    AppController,
    RegistrationController,
    ProjectinfoController,
    UserinfoController,
    AttachmentController,
    ParticipantController,
    LoginController,
    VotingController,
  ],
  providers: [
    { provide: 'APP_INTERCEPTOR', useClass: InfoInterceptor },
    AppService,
    RegistrationService,
    MailerService,
    TokensService,
    BackgroundService,
    EventService,
    ParticipantService,
    ProjectinfoService,
    VotingService,
    UserinfoService,
    AttachmentService,
    AzureBlobService,
  ],
  exports: [],
})
export class AppModule {}
