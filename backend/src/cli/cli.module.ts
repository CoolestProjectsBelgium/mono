import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { RegistrationService } from '../registration/registration.service';
import { ParticipantService } from '../participant/participant.service';
import { EventCommand } from './event.command';
import { CliService } from './cli.service';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { EventService } from '../event/event.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from '../models/account.model';
import { Attachment } from '../models/attachment.model';
import { Award } from '../models/award.model';
import { AzureBlob } from '../models/azure_blob.model';
import { Certificate } from '../models/certificate.model';
import { Event } from '../models/event.model';
import { EventTable } from '../models/event_table.model';
import { Hyperlink } from '../models/hyperlink.model';
import { Location } from '../models/location.model';
import { Message } from '../models/message.model';
import { Project } from '../models/project.model';
import { ProjectTable } from '../models/project_table.model';
import { Question } from '../models/question.model';
import { QuestionRegistration } from '../models/question_registration.model';
import { QuestionTranslation } from '../models/question_translation.model';
import { QuestionUser } from '../models/question_user.model';
import { Registration } from '../models/registration.model';
import { Tshirt } from '../models/tshirt.model';
import { TshirtGroup } from '../models/tshirt_group.model';
import { TshirtGroupTranslation } from '../models/tshirt_group_translation.model';
import { TshirtTranslation } from '../models/tshirt_translation.model';
import { User } from '../models/user.model';
import { Vote } from '../models/vote.model';
import { VoteCategory } from '../models/vote_category.model';
import { Voucher } from '../models/voucher.model';
import { EmailTemplate } from '../models/email_template.model';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: 'mysql',  //dialect: 'postgres',
          host: configService.get('DB_HOST') || 'localhost', //'db',
          port: configService.get('DB_PORT') || 3306,  //5432,
          username: configService.get('DB_USER') || 'coolestproject',
          password: configService.get('DB_PASS') || 'coolestproject',
          database: configService.get('DB_NAME') || 'coolestproject',
          autoLoadModels: true,
          synchronize: true, // Set to false in production
          sync: { force: true },

/*

          dialect: 'mysql',
          host: configService.get('DB_HOST') || 'localhost',
          port: configService.get('DB_PORT') || 3308,
          username: configService.get('DB_USER') || 'coolestproject_proto',
          password: configService.get('DB_PASS') || '44bJXqikC6okq7h',
          database: configService.get('DB_NAME') || 'coolestproject_proto',
          synchronize: true,
          autoLoadModels: true,
*/



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
  ],
  providers: [
    RegistrationService,
    MailerService,
    TokensService,
    EventService,
    EventCommand,
    CliService,
    ParticipantService,
  ],
})
export class CliModule {}
