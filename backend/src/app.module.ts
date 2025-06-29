import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationService } from './registration/registration.service';
import { RegistrationController } from './registration/registration.controller';
import { ProjectinfoController } from './projectinfo/projectinfo.controller';
import { UserinfoController } from './userinfo/userinfo.controller';
import { AttachmentController } from './attachment/attachment.controller';
import { ParticipantController } from './participant/participant.controller';
import { LoginController } from './login/login.controller';
import { MailerService } from './mailer/mailer.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Event } from './models/event.model';
import { Tshirt } from './models/tshirt.model';
import { EventTable } from './models/event_table.model';
import { ProjectTable } from './models/project_table.model';
import { Question } from './models/question.model';
import { QuestionUser } from './models/question_user.model';
import { QuestionRegistration } from './models/question_registration.model';
import { Project } from './models/project.model';
import { Location } from './models/location.model';
import { Registration } from './models/registration.model';
import { TshirtGroup } from './models/tshirt_group.model';
import { TshirtGroupTranslation } from './models/tshirt_group_translation.model';
import { TshirtTranslation } from './models/tshirt_translation.model';
import { QuestionTranslation } from './models/question_translation.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
//import { AzureBlobService } from './azureblob/azureblob.service';
import { TokensService } from './tokens/tokens.service';
import { Voucher } from './models/voucher.model';
import { AzureBlob } from './models/azure_blob.model';
import { Attachment } from './models/attachment.model';
import { Hyperlink } from './models/hyperlink.model';
import { Certificate } from './models/certificate.model';
import { Message } from './models/message.model';
import { Vote } from './models/vote.model';
import { VoteCategory } from './models/vote_category.model';
import { Account } from './models/account.model';
import { Award } from './models/award.model';
import { ScheduleModule } from '@nestjs/schedule';
import { BackgroundService } from './background/background.service';
//import { AdminModule } from './admin/admin.module';
//import { CliModule } from './cli/cli.module';
import { EventService } from './event/event.service';
import { EmailTemplate } from './models/email_template.model';
import { ParticipantService } from './participant/participant.service';
import { ProjectinfoService } from './projectinfo/projectinfo.service';
import { InfoInterceptor } from './info.interceptor';

import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
    }),
    //AdminModule.register(1),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: configService.get('DB_DIALECT'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER') ,
          password: configService.get('DB_PASS'),
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
            EmailTemplate,
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
    ]),
    //AdminModule,
    //CliModule,
  ],
  controllers: [
    AppController,
    RegistrationController,
    ProjectinfoController,
    UserinfoController,
    AttachmentController,
    ParticipantController,
    LoginController,
  ],
  providers: [
    InfoInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: InfoInterceptor,
    },
    AppService,
    RegistrationService,
    MailerService,
    //AzureBlobService,
    TokensService,
    BackgroundService,
    EventService,
    ParticipantService,
    ProjectinfoService,
  ],
  exports: [
    InfoInterceptor
  ],
})
export class AppModule {}
