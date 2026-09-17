import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Affiliation,
  Attachment,
  Account,
  Certificate,
  CertificateTemplate,
  EmailTemplate,
  Event,
  EventTable,
  Municipality,
  PresentationSlide,
  Project,
  Question,
  QuestionRegistration,
  QuestionTranslation,
  QuestionUser,
  Tshirt,
  TshirtGroup,
  TshirtGroupTranslation,
  TshirtTranslation,
  User,
  UserProject,
  Registration,
  Vote,
  VoteCategory,
} from '@coolestprojects/database';
import { AppModule } from '../src/app.module';
import { seedDatabase } from '../src/seeder/seed';

export default async () => {
  // Point at a dedicated test database (DB_*_TEST) rather than DB_*, since
  // this seed runs `sequelize.sync({ force: true })` — a destructive
  // drop-and-recreate that must never touch the dev/prod database.
  process.env.DB_NAME = process.env.DB_NAME_TEST;
  process.env.DB_HOST = process.env.DB_HOST_TEST;
  process.env.DB_PORT = process.env.DB_PORT_TEST;
  process.env.DB_USER = process.env.DB_USER_TEST;
  process.env.DB_PASSWORD = process.env.DB_PASSWORD_TEST;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    providers: [],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  // Clean test database
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ force: true });

  // load testing data — model order matches seedDatabase's signature, see
  // src/cli/event.command.ts's `initEventDB` for the canonical call.
  await seedDatabase(
    app.get<typeof Event>(getModelToken(Event)),
    app.get<typeof TshirtGroup>(getModelToken(TshirtGroup)),
    app.get<typeof Question>(getModelToken(Question)),
    app.get<typeof QuestionTranslation>(getModelToken(QuestionTranslation)),
    app.get<typeof Tshirt>(getModelToken(Tshirt)),
    app.get<typeof TshirtGroupTranslation>(
      getModelToken(TshirtGroupTranslation),
    ),
    app.get<typeof EventTable>(getModelToken(EventTable)),
    app.get<typeof EmailTemplate>(getModelToken(EmailTemplate)),
    app.get<typeof TshirtTranslation>(getModelToken(TshirtTranslation)),
    app.get<typeof Account>(getModelToken(Account)),
    app.get<typeof Project>(getModelToken(Project)),
    app.get<typeof User>(getModelToken(User)),
    app.get<typeof Attachment>(getModelToken(Attachment)),
    app.get<typeof UserProject>(getModelToken(UserProject)),
    app.get<typeof Registration>(getModelToken(Registration)),
    app.get<typeof QuestionRegistration>(getModelToken(QuestionRegistration)),
    app.get<typeof QuestionUser>(getModelToken(QuestionUser)),
    app.get<typeof VoteCategory>(getModelToken(VoteCategory)),
    app.get<typeof Vote>(getModelToken(Vote)),
    app.get<typeof Affiliation>(getModelToken(Affiliation)),
    app.get<typeof Municipality>(getModelToken(Municipality)),
    app.get<typeof PresentationSlide>(getModelToken(PresentationSlide)),
    app.get<typeof Certificate>(getModelToken(Certificate)),
    app.get<typeof CertificateTemplate>(getModelToken(CertificateTemplate)),
  );
  await app.close();
};
