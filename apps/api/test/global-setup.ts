import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { seedDatabase } from '../src/seeder/seed';
import { Event } from '../../../packages/database/src/models/event.model';
import { TshirtGroup } from '../../../packages/database/src/models/tshirt_group.model';
import { Question } from '../../../packages/database/src/models/question.model';
import { QuestionTranslation } from '../../../packages/database/src/models/question_translation.model';
import { Tshirt } from '../../../packages/database/src/models/tshirt.model';
import { Location } from '../../../packages/database/src/models/location.model';
import { TshirtGroupTranslation } from '../../../packages/database/src/models/tshirt_group_translation.model';
import { EventTable } from '../../../packages/database/src/models/event_table.model';
import { EmailTemplate } from '../../../packages/database/src/models/email_template.model';
import { TshirtTranslation } from '../../../packages/database/src/models/tshirt_translation.model';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

export default async () => {
  // Set environment variables for testing
  process.env.DB_NAME = process.env.DB_NAME_TEST;
  process.env.DB_HOST = process.env.DB_HOST_TEST;
  process.env.DB_PORT = process.env.DB_PORT;
  process.env.DB_USER = process.env.DB_USER_TEST;
  process.env.DB_PASS = process.env.DB_PASS_TEST;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    providers: [],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  // Clean test database
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ force: true });

  // load testing data
  await seedDatabase(
    app.get<typeof Event>(getModelToken(Event)),
    app.get<typeof TshirtGroup>(getModelToken(TshirtGroup)),
    app.get<typeof Question>(getModelToken(Question)),
    app.get<typeof QuestionTranslation>(getModelToken(QuestionTranslation)),
    app.get<typeof Tshirt>(getModelToken(Tshirt)),
    app.get<typeof TshirtGroupTranslation>(
      getModelToken(TshirtGroupTranslation),
    ),
    app.get<typeof Location>(getModelToken(Location)),
    app.get<typeof EventTable>(getModelToken(EventTable)),
    app.get<typeof EmailTemplate>(getModelToken(EmailTemplate)),
    app.get<typeof TshirtTranslation>(getModelToken(TshirtTranslation)),
    //app.get<RegistrationService>(RegistrationService),
    //app.get<ParticipantService>(ParticipantService),
    //app.get<TokensService>(TokensService),
  );
  await app.close();
};
