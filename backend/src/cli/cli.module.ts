import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { RegistrationService } from '../registration/registration.service';
import { EventCommand } from './event.command';
import { CliService } from './cli.service';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { EventService } from '../event/event.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/models/account.model';
import { Attachment } from 'src/models/attachment.model';
import { Award } from 'src/models/award.model';
import { AzureBlob } from 'src/models/azure_blob.model';
import { Certificate } from 'src/models/certificate.model';
import { Event } from 'src/models/event.model';
import { EventTable } from 'src/models/event_table.model';
import { Hyperlink } from 'src/models/hyperlink.model';
import { Location } from 'src/models/location.model';
import { Message } from 'src/models/message.model';
import { Project } from 'src/models/project.model';
import { ProjectTable } from 'src/models/project_table.model';
import { Question } from 'src/models/question.model';
import { QuestionRegistration } from 'src/models/question_registration.model';
import { QuestionTranslation } from 'src/models/question_translation.model';
import { QuestionUser } from 'src/models/question_user.model';
import { Registration } from 'src/models/registration.model';
import { Tshirt } from 'src/models/tshirt.model';
import { TshirtGroup } from 'src/models/tshirt_group.model';
import { TshirtGroupTranslation } from 'src/models/tshirt_group_translation.model';
import { TshirtTranslation } from 'src/models/tshirt_translation.model';
import { User } from 'src/models/user.model';
import { Vote } from 'src/models/vote.model';
import { VoteCategory } from 'src/models/vote_category.model';
import { Voucher } from 'src/models/voucher.model';

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
          dialect: 'mysql',
          host: configService.get('DB_HOST') || 'localhost',
          port: configService.get('DB_PORT') || 3308,
          username: configService.get('DB_USER') || 'coolestproject_proto',
          password: configService.get('DB_PASS') || '44bJXqikC6okq7h',
          database: configService.get('DB_NAME') || 'coolestproject_proto',
          synchronize: true,
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
    ]),
  ],
  providers: [
    RegistrationService,
    MailerService,
    TokensService,
    EventService,
    EventCommand,
    CliService,
  ],
})
export class CliModule {}
