import {
  Affiliation,
  Attachment,
  Account,
  Award,
  Certificate,
  CertificateRender,
  CertificateTemplate,
  EmailLog,
  EmailTemplate,
  Event,
  EventTable,
  Log,
  Message,
  Municipality,
  PresentationCheckin,
  PresentationRender,
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
import type { CreationAttributes } from 'sequelize';
import { buildSeedEmailTemplates } from '../mailer/seed-email-templates';
import { buildSeedCertificateTemplates } from './seed-certificate-template';
import { loadSeedDojoNames } from './load-seed-dojos';
import { loadSeedMunicipalities } from './load-seed-municipalities';
import { buildSeedPresentationSlides } from './seed-presentation-slides';
import {
  APPROVAL_QUESTION_NAME,
  CONTACT_QUESTION_NAME,
  PHOTO_QUESTION_NAME,
  buildQuestionTranslationRows,
} from './seed-question-translations';
import {
  assignProjectsToEventTables,
  VOTING_TEST_PROJECTS,
} from './seed-voting-fixtures';
import { SEED_FLOORPLAN_FILENAME, seedFloorplan } from './seed-floorplan';
import { seedProjectPictures } from './seed-project-pictures';
import { randomUUID } from 'crypto';

/**
 * Wipes every table this seeder populates before reseeding. Runs on every
 * container start (via start.sh -> npm run seed-db), so without this, each
 * restart added another duplicate Event on top of the last instead of
 * replacing it — see the mismatched email-uniqueness failures that produced.
 * Truncation order is irrelevant: FK checks are off for the duration.
 */
async function resetSeedTables(
  models: Array<{
    destroy: (options: Record<string, unknown>) => Promise<unknown>;
  }>,
  sequelize: NonNullable<typeof Event.sequelize>,
) {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const model of models) {
      await model.destroy({ truncate: true, force: true });
    }
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

export async function seedDatabase(
  eventModel: typeof Event,
  tshirtGroupModel: typeof TshirtGroup,
  questionModel: typeof Question,
  questionTranslationModel: typeof QuestionTranslation,
  tshirtModel: typeof Tshirt,
  tshirtGroupTranslationModel: typeof TshirtGroupTranslation,
  eventTableModel: typeof EventTable,
  emailTemplateModel: typeof EmailTemplate,
  tshirtTranslationModel: typeof TshirtTranslation,
  accountModel: typeof Account,
  projectModel: typeof Project,
  userModel: typeof User,
  attachmentModel: typeof Attachment,
  userProjectModel: typeof UserProject,
  registrationModel: typeof Registration,
  questionRegistrationModel: typeof QuestionRegistration,
  questionUserModel: typeof QuestionUser,
  voteCategoryModel: typeof VoteCategory,
  voteModel: typeof Vote,
  affiliationModel: typeof Affiliation,
  municipalityModel: typeof Municipality,
  presentationSlideModel: typeof PresentationSlide,
  certificateModel: typeof Certificate,
  certificateTemplateModel: typeof CertificateTemplate,
  certificateRenderModel: typeof CertificateRender,
  presentationRenderModel: typeof PresentationRender,
  presentationCheckinModel: typeof PresentationCheckin,
  awardModel: typeof Award,
  messageModel: typeof Message,
  emailLogModel: typeof EmailLog,
  logModel: typeof Log,
) {
  await resetSeedTables(
    [
      attachmentModel,
      questionUserModel,
      questionRegistrationModel,
      userProjectModel,
      voteModel,
      voteCategoryModel,
      registrationModel,
      userModel,
      projectModel,
      certificateRenderModel,
      certificateModel,
      certificateTemplateModel,
      presentationRenderModel,
      presentationCheckinModel,
      presentationSlideModel,
      awardModel,
      eventTableModel,
      emailTemplateModel,
      emailLogModel,
      messageModel,
      logModel,
      accountModel,
      tshirtTranslationModel,
      tshirtGroupTranslationModel,
      tshirtModel,
      questionTranslationModel,
      questionModel,
      tshirtGroupModel,
      affiliationModel,
      municipalityModel,
      eventModel,
    ],
    eventModel.sequelize!,
  );

  const eventBeginDate = new Date();
  eventBeginDate.setDate(new Date().getDate() - 100);

  const registrationOpenDate = new Date();
  registrationOpenDate.setDate(new Date().getDate() - 90);

  const registrationClosedDate = new Date();
  registrationClosedDate.setDate(new Date().getDate() + 10);

  const projectClosedDate = new Date();
  projectClosedDate.setDate(new Date().getDate() + 20);

  const officialStartDate = new Date();
  officialStartDate.setDate(new Date().getDate() + 5);

  const eventEndDate = new Date();
  eventEndDate.setDate(new Date().getDate() + 40);

  // Voting is a 4-hour window during the event day itself.
  const votingStartDate = new Date(officialStartDate);

  const votingEndDate = new Date(
    officialStartDate.getTime() + 4 * 60 * 60 * 1000,
  );

  const event = await eventModel.create({
    floorplanPath: SEED_FLOORPLAN_FILENAME,
    minAge: 7,
    maxAge: 18,
    minGuardianAge: 16,
    maxRegistration: 64,
    maxVoucher: 3,
    eventBeginDate: eventBeginDate,
    registrationOpenDate: registrationOpenDate,
    registrationClosedDate: registrationClosedDate,
    projectClosedDate: projectClosedDate,
    officialStartDate: officialStartDate,
    // Must be in the future: InfoInterceptor requires eventBeginDate < now < eventEndDate
    eventEndDate: eventEndDate,
    votingStartDate,
    votingEndDate,
    maxFileSize: 2147483647,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folderName: 'coolestprojects',
    eventTitle: 'Coolest Projects Active Event',
  });

  const groups = await tshirtGroupModel.bulkCreate([
    {
      eventId: event.id,
      name: 'kids',
    },
    {
      eventId: event.id,
      name: 'adults',
    },
  ]);

  const questions = await questionModel.bulkCreate([
    {
      eventId: event.id,
      name: PHOTO_QUESTION_NAME,
    },
    {
      eventId: event.id,
      name: CONTACT_QUESTION_NAME,
    },
    {
      eventId: event.id,
      name: APPROVAL_QUESTION_NAME,
      mandatory: 1,
    },
  ]);
  await affiliationModel.bulkCreate(
    loadSeedDojoNames().map((name) => ({
      eventId: event.id,
      name,
    })),
  );
  await municipalityModel.bulkCreate(
    loadSeedMunicipalities().map((entry) => ({
      eventId: event.id,
      postalcode: entry.postalcode,
      municipality_name_nl: entry.municipality_name_nl,
      municipality_name_fr: entry.municipality_name_fr,
      municipality_name_de: entry.municipality_name_de,
      region: entry.region,
    })),
  );

  await questionTranslationModel.bulkCreate(
    buildQuestionTranslationRows(event.id, {
      [PHOTO_QUESTION_NAME]: questions[0].id,
      [CONTACT_QUESTION_NAME]: questions[1].id,
      [APPROVAL_QUESTION_NAME]: questions[2].id,
    }),
  );

  await tshirtGroupTranslationModel.bulkCreate([
    {
      eventId: event.id,
      language: 'en',
      description: 'kids',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adults',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte',
      groupId: groups[1].id,
    },
  ]);

  const tshirts = await tshirtModel.bulkCreate([
    {
      eventId: event.id,
      name: 'kid_3-4',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      name: 'kid_5-6',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      name: 'kid_7-8',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      name: 'kid_9-11',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      name: 'kid_12-14',
      groupId: groups[0].id,
    },
    {
      eventId: event.id,
      name: 'adult_XXS',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_XS',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_S',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_M',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_L',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_XL',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_XXL',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_3XL',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_4XL',
      groupId: groups[1].id,
    },
    {
      eventId: event.id,
      name: 'adult_5XL',
      groupId: groups[1].id,
    },
  ]);

  // TODO all translations
  await tshirtTranslationModel.bulkCreate([
    {
      eventId: event.id,
      language: 'en',
      description: 'kid_3-4',
      tshirtId: tshirts[0].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'kid_5-6',
      tshirtId: tshirts[1].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'kid_7-8',
      tshirtId: tshirts[2].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'kid_9-11',
      tshirtId: tshirts[3].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'kid_12-14',
      tshirtId: tshirts[4].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_XXS',
      tshirtId: tshirts[5].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_XS',
      tshirtId: tshirts[6].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_S',
      tshirtId: tshirts[7].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_M',
      tshirtId: tshirts[8].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_L',
      tshirtId: tshirts[9].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_XL',
      tshirtId: tshirts[10].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_XXL',
      tshirtId: tshirts[11].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_3XL',
      tshirtId: tshirts[12].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_4XL',
      tshirtId: tshirts[13].id,
    },
    {
      eventId: event.id,
      language: 'en',
      description: 'adult_5XL',
      tshirtId: tshirts[14].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind_3-4',
      tshirtId: tshirts[0].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind_5-6',
      tshirtId: tshirts[1].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind_7-8',
      tshirtId: tshirts[2].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind_9-11',
      tshirtId: tshirts[3].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'kind_12-14',
      tshirtId: tshirts[4].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_XXS',
      tshirtId: tshirts[5].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_XS',
      tshirtId: tshirts[6].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_S',
      tshirtId: tshirts[7].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_M',
      tshirtId: tshirts[8].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_L',
      tshirtId: tshirts[9].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_XL',
      tshirtId: tshirts[10].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_XXL',
      tshirtId: tshirts[11].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_3XL',
      tshirtId: tshirts[12].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_4XL',
      tshirtId: tshirts[13].id,
    },
    {
      eventId: event.id,
      language: 'nl',
      description: 'volwassen_5XL',
      tshirtId: tshirts[14].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants_3-4',
      tshirtId: tshirts[0].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants_5-6',
      tshirtId: tshirts[1].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants_7-8',
      tshirtId: tshirts[2].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants_9-11',
      tshirtId: tshirts[3].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'enfants_12-14',
      tshirtId: tshirts[4].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_XXS',
      tshirtId: tshirts[5].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_XS',
      tshirtId: tshirts[6].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_S',
      tshirtId: tshirts[7].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_M',
      tshirtId: tshirts[8].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_L',
      tshirtId: tshirts[9].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_XL',
      tshirtId: tshirts[10].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_XXL',
      tshirtId: tshirts[11].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_3XL',
      tshirtId: tshirts[12].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_4XL',
      tshirtId: tshirts[13].id,
    },
    {
      eventId: event.id,
      language: 'fr',
      description: 'adulte_5XL',
      tshirtId: tshirts[14].id,
    },
  ]);

  await eventTableModel.bulkCreate([
    {
      eventId: event.id,
      name: 'Tafel_01',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_02',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_03',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_04',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_05',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_06',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_07',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_08',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_09',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_10',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_11',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_12',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_13',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_14',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_15',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_16',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_17',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_18',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_19',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_20',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_21',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_22',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_23',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_24',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_25',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_26',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_27',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_28',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_29',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_30',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_31',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_32',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_33',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_34',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_35',
      requirements: null,
      maxPlaces: 4,
    },
    {
      eventId: event.id,
      name: 'Tafel_36',
      requirements: null,
      maxPlaces: 4,
    },
  ]);

  await emailTemplateModel.bulkCreate(
    buildSeedEmailTemplates(event.id) as unknown as Parameters<
      typeof emailTemplateModel.bulkCreate
    >[0],
  );

  const accounts = await accountModel.bulkCreate([
    {
      email: 'admin',
      encryptedPassword: accountModel.hashPassword('admin'),
      account_type: 'admin',
    },
    {
      email: 'superadmin',
      encryptedPassword: accountModel.hashPassword('superadmin'),
      account_type: 'super_admin',
    },
    {
      email: 'jury',
      encryptedPassword: accountModel.hashPassword('jury'),
      account_type: 'jury',
    },
    {
      email: 'jury2',
      encryptedPassword: accountModel.hashPassword('jury2'),
      account_type: 'jury',
    },
    {
      email: 'jury3',
      encryptedPassword: accountModel.hashPassword('jury3'),
      account_type: 'jury',
    },
    {
      email: 'presentation',
      encryptedPassword: accountModel.hashPassword('presentation'),
      account_type: 'presentation',
    },
  ]);
  const voteCategories = await voteCategoryModel.bulkCreate([
    {
      eventId: event.id,
      name: 'Creativity',
      min: 1,
      max: 10,
      public: false,
      optional: false,
    },
    {
      eventId: event.id,
      name: 'Technical skill',
      min: 1,
      max: 10,
      public: false,
      optional: false,
    },
    {
      eventId: event.id,
      name: 'Presentation',
      min: 1,
      max: 5,
      public: false,
      optional: true,
    },
  ]);
  /**/
  const registration = await registrationModel.bulkCreate([
    {
      eventId: event.id,
      language: 'en',
      email: 'registration.project@example.com',
      firstname: 'Project',
      lastname: 'Owner',
      sex: 'm',
      birthmonth: new Date(new Date().getFullYear() - 12, 0, 1),
      postalcode: 1000,
      municipality_name: 'Brussels',
      street: 'Main Street',
      house_number: '1',
      tshirtId: tshirts[2].id,
      project_name: 'Seed Project',
      project_descr: 'A project created from the seed data.',
      project_lang: 'en',
      project_type: 'Technology',
      project_code: null,
      waiting_list: false,
    },
    {
      eventId: event.id,
      language: 'nl',
      email: 'registration.participant@example.com',
      firstname: 'Project',
      lastname: 'Participant',
      sex: 'f',
      birthmonth: new Date(new Date().getFullYear() - 11, 0, 1),
      postalcode: 2000,
      municipality_name: 'Antwerp',
      street: 'Park Lane',
      house_number: '2',
      tshirtId: tshirts[3].id,
      project_code: randomUUID(),
      waiting_list: true,
    },
    {
      eventId: event.id,
      language: 'fr',
      email: 'registration.old@example.com',
      firstname: 'Older',
      lastname: 'Registration',
      sex: 'x',
      birthmonth: new Date(new Date().getFullYear() - 15, 0, 1),
      postalcode: 4000,
      municipality_name: 'Liege',
      street: 'River Road',
      house_number: '3',
      tshirtId: tshirts[4].id,
      project_name: 'Older Seed Project',
      project_descr: 'An older registration for testing overdue handling.',
      project_lang: 'fr',
      project_type: 'Art',
      project_code: null,
      waiting_list: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  await questionRegistrationModel.bulkCreate([
    ...registration.map((item) => ({
      eventId: event.id,
      registrationId: item.id,
      questionId: questions[2].id,
    })),
    {
      eventId: event.id,
      registrationId: registration[0].id,
      questionId: questions[0].id,
    },
    {
      eventId: event.id,
      registrationId: registration[1].id,
      questionId: questions[1].id,
    },
  ]);

  const projects = await projectModel.bulkCreate([
    ...VOTING_TEST_PROJECTS.map((project) => ({
      ...project,
      eventId: event.id,
    })),
    {
      name: 'Archived Voting Project',
      eventId: event.id,
      language: 'fr',
      type: 'Technology',
      description: 'Soft-deleted project for voting edge cases.',
      maxVoucher: 3,
      deletedAt: new Date(),
    },
  ]);

  await assignProjectsToEventTables(event.id, eventTableModel, projects);

  const voteStart = Date.now() - 3 * 24 * 60 * 60 * 1000;
  await voteModel.bulkCreate([
    {
      eventId: event.id,
      accountId: accounts[1].id,
      categoryId: voteCategories[0].id,
      amount: 9,
      createdAt: new Date(voteStart + 0 * 10 * 60 * 1000),
      projectId: projects[0].id,
    },
    {
      eventId: event.id,
      accountId: accounts[1].id,
      categoryId: voteCategories[1].id,
      amount: 2,
      createdAt: new Date(voteStart + 1 * 10 * 60 * 1000),
      projectId: projects[0].id,
    },
    {
      eventId: event.id,
      accountId: accounts[1].id,
      categoryId: voteCategories[2].id,
      amount: 5,
      createdAt: new Date(voteStart + 2 * 10 * 60 * 1000),
      projectId: projects[0].id,
    },

    {
      eventId: event.id,
      accountId: accounts[3].id,
      categoryId: voteCategories[0].id,
      amount: 1,
      createdAt: new Date(voteStart + 3 * 10 * 60 * 1000),
      projectId: projects[1].id,
    },
    {
      eventId: event.id,
      accountId: accounts[3].id,
      categoryId: voteCategories[1].id,
      amount: 10,
      createdAt: new Date(voteStart + 4 * 10 * 60 * 1000),
      projectId: projects[1].id,
    },
    {
      eventId: event.id,
      accountId: accounts[3].id,
      categoryId: voteCategories[2].id,
      amount: 4,
      createdAt: new Date(voteStart + 5 * 10 * 60 * 1000),
      projectId: projects[1].id,
    },

    {
      eventId: event.id,
      accountId: accounts[4].id,
      categoryId: voteCategories[0].id,
      amount: 7,
      createdAt: new Date(voteStart + 6 * 10 * 60 * 1000),
      projectId: projects[2].id,
    },
    {
      eventId: event.id,
      accountId: accounts[4].id,
      categoryId: voteCategories[1].id,
      amount: 7,
      createdAt: new Date(voteStart + 7 * 10 * 60 * 1000),
      projectId: projects[2].id,
    },
  ]);

  const users = await userModel.bulkCreate([
    {
      eventId: event.id,
      email: 'user1@user.be',
      firstname: 'User 1',
      lastname: 'User 1',
      sex: 'M',
      language: 'en',
      birthmonth: new Date(new Date().getFullYear() - 7, 0, 1),
      postalcode: '1000',
      municipality_name: 'Brussel',
      phone: '+32 470 00 00 01',
      guardian_firstname: 'Guardian 1',
      guardian_lastname: 'User 1',
      guardian_email: 'guardian1@user.be',
      guardian_phone: '+32 470 10 00 01',
      tshirtId: tshirts[3].id,
    },
    {
      eventId: event.id,
      email: 'user2@user.be',
      firstname: 'User 2',
      lastname: 'User 2',
      sex: 'F',
      language: 'nl',
      birthmonth: new Date(new Date().getFullYear() - 12, 0, 1),
      postalcode: '2000',
      municipality_name: 'Antwerpen',
      phone: '+32 470 00 00 02',
      guardian_firstname: 'Guardian 2',
      guardian_lastname: 'User 2',
      guardian_email: 'guardian2@user.be',
      guardian_phone: '+32 470 10 00 02',
      tshirtId: tshirts[0].id,
    },
    {
      eventId: event.id,
      email: 'user3@user.be',
      firstname: 'User 3',
      lastname: 'User 3',
      sex: 'F',
      language: 'nl',
      birthmonth: new Date(new Date().getFullYear() - 15, 0, 1),
      postalcode: '3000',
      municipality_name: 'Leuven',
      phone: '+32 470 00 00 03',
      guardian_firstname: 'Guardian 3',
      guardian_lastname: 'User 3',
      guardian_email: 'guardian3@user.be',
      guardian_phone: '+32 470 10 00 03',
      tshirtId: tshirts[4].id,
    },
    {
      eventId: event.id,
      email: 'user4@user.be',
      firstname: 'User 4',
      lastname: 'User 4',
      sex: 'X',
      language: 'fr',
      birthmonth: new Date(new Date().getFullYear() - 16, 0, 1),
      postalcode: '4000',
      municipality_name: 'Luik',
      phone: '+32 470 00 00 04',
      tshirtId: tshirts[1].id,
    },
    {
      eventId: event.id,
      email: 'user5@user.be',
      firstname: 'User 5',
      lastname: 'User 5',
      sex: 'X',
      language: 'fr',
      birthmonth: new Date(new Date().getFullYear() - 18, 0, 1),
      postalcode: '5000',
      municipality_name: 'Namen',
      phone: '+32 470 00 00 05',
      tshirtId: tshirts[1].id,
    },
  ]);

  await userProjectModel.bulkCreate([
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[0].id,
      userId: users[0].id,
    },
    {
      eventId: event.id,
      isOwner: false,
      projectId: projects[0].id,
      userId: users[1].id,
      voucherGuid: '1',
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[1].id,
      userId: users[2].id,
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[2].id,
      userId: users[3].id,
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[3].id,
      userId: users[4].id,
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[4].id,
      userId: users[0].id,
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[5].id,
      userId: users[2].id,
    },
    {
      eventId: event.id,
      isOwner: true,
      projectId: projects[6].id,
      userId: users[4].id,
      deletedAt: new Date(),
    },
    {
      eventId: event.id,
      isOwner: false,
      projectId: projects[6].id,
      voucherGuid: '2',
    },
    {
      eventId: event.id,
      isOwner: false,
      projectId: projects[6].id,
      voucherGuid: '3',
    },
  ]);

  await questionUserModel.bulkCreate([
    ...users.map((user) => ({
      eventId: event.id,
      userId: user.id,
      questionId: questions[2].id,
    })),
    ...users.map((user) => ({
      eventId: event.id,
      userId: user.id,
      questionId: questions[0].id,
    })),
    {
      eventId: event.id,
      userId: users[1].id,
      questionId: questions[1].id,
    },
  ]);

  await presentationSlideModel.bulkCreate(
    buildSeedPresentationSlides(event.id),
  );

  await certificateTemplateModel.bulkCreate(
    buildSeedCertificateTemplates(event.id),
  );

  // Example certificate text for a couple of projects, showing both a
  // hand-written blurb and one that reads as if seeded from an award — the
  // rest are left blank so the "sync from awards"/manual-entry flow on the
  // admin Certificates page has something to demonstrate too.
  await certificateModel.bulkCreate([
    {
      eventId: event.id,
      projectId: projects[0].id,
      text: 'Your line-following robot impressed the jury with its clean wiring and reliable sensor tuning — great engineering!',
    },
    {
      eventId: event.id,
      projectId: projects[1].id,
      text: 'A polished, genuinely useful dashboard — the jury loved how clearly the live readings were presented.',
    },
  ]);

  if (process.env.UPLOAD_ROOT) {
    const projectAttachments = await seedProjectPictures(
      process.env.UPLOAD_ROOT,
      event.folderName,
      event.id,
      projects,
    );
    if (projectAttachments.length > 0) {
      await attachmentModel.bulkCreate(
        projectAttachments as unknown as CreationAttributes<Attachment>[],
      );
    }
    await seedFloorplan(process.env.UPLOAD_ROOT);
  }
}
