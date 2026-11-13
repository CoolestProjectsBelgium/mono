import 'dotenv/config';
import {
  Account,
  Award,
  Certificate,
  CertificateTemplate,
  Event,
  EventTable,
  EmailTemplate,
  Log,
  Municipality,
  Project,
  Question,
  QuestionRegistration,
  QuestionTranslation,
  QuestionUser,
  PresentationCheckin,
  PresentationSlide,
  Registration,
  Tshirt,
  TshirtGroup,
  TshirtGroupTranslation,
  TshirtTranslation,
  User,
  VoteCategory,
  UserProject,
  Attachment,
  Vote,
  Affiliation,
} from '@coolestprojects/database';

import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT as string,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [
    Event,
    Award,
    Project,
    VoteCategory,
    Account,
    EventTable,
    User,
    UserProject,
    Tshirt,
    QuestionUser,
    Question,
    TshirtGroup,
    TshirtTranslation,
    QuestionTranslation,
    QuestionRegistration,
    Registration,
    TshirtGroupTranslation,
    Attachment,
    Vote,
    Affiliation,
    Municipality,
    EmailTemplate,
    PresentationSlide,
    PresentationCheckin,
    Certificate,
    CertificateTemplate,
    Log,
  ],
  // SQL statement logging is opt-in (DB_LOGGING=true), same flag as apps/api.
  logging: ['1', 'true', 'yes'].includes(
    (process.env.DB_LOGGING ?? '').trim().toLowerCase(),
  )
    ? console.log
    : false,
} as any);

await sequelize.authenticate();
