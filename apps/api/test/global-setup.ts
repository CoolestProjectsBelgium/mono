import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { seedDatabase } from '../src/seeder/seed';
import {
  Event,
  TshirtGroup,
  Question,
  QuestionTranslation,
  Tshirt,
  Location,
  TshirtGroupTranslation,
  EventTable,
  EmailTemplate,
  TshirtTranslation,
} from '@coolestprojects/database';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

export default async () => {
  process.env.DB_DIALECT = process.env.DB_DIALECT ?? 'mysql';
  process.env.DB_NAME = process.env.DB_NAME_TEST;
  process.env.DB_HOST = process.env.DB_HOST_TEST;
  process.env.DB_PORT = process.env.DB_PORT_TEST ?? '3306';
  process.env.DB_USER = process.env.DB_USER_TEST;
  process.env.DB_PASSWORD = process.env.DB_PASSWORD_TEST;
  process.env.JWT_KEY = process.env.JWT_KEY ?? 'test-jwt-key';
  process.env.VOTING_KEY = process.env.VOTING_KEY ?? 'test-voting-key';
  process.env.REGISTRATION_URL =
    process.env.REGISTRATION_URL ??
    'https://registration.coolestprojects.localhost:8443';
  process.env.WEBSITE_URL =
    process.env.WEBSITE_URL ?? 'https://coolestprojects.be';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    providers: [],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ force: true });

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
  );
  await app.close();
};
