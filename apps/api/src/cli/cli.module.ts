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
import { Account } from '@coolestprojects/database';
import { Attachment } from '@coolestprojects/database';
import { Award } from '@coolestprojects/database';
import { Certificate } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { EventTable } from '@coolestprojects/database';
import { Message } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { QuestionRegistration } from '@coolestprojects/database';
import { QuestionTranslation } from '@coolestprojects/database';
import { QuestionUser } from '@coolestprojects/database';
import { Registration } from '@coolestprojects/database';
import { Tshirt } from '@coolestprojects/database';
import { TshirtGroup } from '@coolestprojects/database';
import { TshirtGroupTranslation } from '@coolestprojects/database';
import { TshirtTranslation } from '@coolestprojects/database';
import { User } from '@coolestprojects/database';
import { Vote } from '@coolestprojects/database';
import { VoteCategory } from '@coolestprojects/database';
import { Voucher } from '@coolestprojects/database';
import { EmailTemplate } from '@coolestprojects/database';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: 'mysql', 
          host: configService.get('DB_HOST') || 'localhost', 
          port: configService.get('DB_PORT') || 3306,
          username: configService.get('DB_USER') || 'coolestproject',
          password: configService.get('DB_PASSWORD') || 'coolestproject',
          database: configService.get('DB_NAME') || 'coolestproject',
          autoLoadModels: true,
          synchronize: true, 
          sync: { force: true },

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
            Voucher,
            Attachment,
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
      EventTable,
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
export class CliModule { }
