import { Attachment, Account, EmailTemplate, Event, EventTable, Project, Question, QuestionTranslation, Tshirt, TshirtGroup, TshirtGroupTranslation, TshirtTranslation, User, UserProject, Registration } from '@coolestprojects/database';
import { buildSeedEmailTemplates } from '../mailer/seed-email-templates';
import * as path from 'path';
import { randomUUID } from 'crypto';

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
  registrationModel: typeof Registration
) {
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

  const event = await eventModel.create({
    floorplanPath: 'floorplan_active.svg',
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
      name: 'Agree to Photo',
    },
    {
      eventId: event.id,
      name: 'Agree to Contact',
    },
    {
      eventId: event.id,
      name: 'Approved',
      mandatory: 1,
    },
  ]);
  await questionTranslationModel.bulkCreate([
    {
      eventId: event.id,
      language: 'en',
      questionId: questions[0].id,
      positive: 'That is no problem',
      negative:
        "Don't use any pictures or movies where the participant is reconizable",
      description:
        'It is possible that the participant is photographed or filmed',
    },
    {
      eventId: event.id,
      language: 'en',
      questionId: questions[1].id,
      positive: 'Yes',
      negative: 'No',
      description: 'Can CoderDojo contact you for the next edition',
    },
    {
      eventId: event.id,
      language: 'en',
      questionId: questions[2].id,
      positive: 'Yes',
      negative: 'No',
      description: 'Be sure to read our rules. Do you agree',
    },
    {
      eventId: event.id,
      language: 'nl',
      questionId: questions[0].id,
      positive: 'Dat is geen probleem',
      negative:
        'Gelieve geen foto’s en filmpjes te gebruiken waarop de deelnemer herkenbaar is',
      description:
        'Het is mogelijk dat de deelnemer gefotografeerd of gefilmd wordt',
    },
    {
      eventId: event.id,
      language: 'nl',
      questionId: questions[1].id,
      positive: 'Ja',
      negative: 'Nee',
      description: 'Mag CoderDojo je contacteren voor de volgende editie?',
    },
    {
      eventId: event.id,
      language: 'nl',
      questionId: questions[2].id,
      positive: 'Ja',
      negative: 'Nee',
      description: 'Lees zeker onze regels. Ga je akkoord?',
    },
    {
      eventId: event.id,
      language: 'fr',
      questionId: questions[0].id,
      positive: "Je suis d'accord",
      negative:
        'Je ne suis pas d’accord que l’on utilise les images et vidéos si le ou la participant.e est reconnaissable',
      description:
        'Le ou la participant.e peut être photographié.e ou filmé.e.',
    },
    {
      eventId: event.id,
      language: 'fr',
      questionId: questions[1].id,
      positive: 'Qui',
      negative: 'Non',
      description:
        'CoderDojo peut-il vous contacter pour la prochaine édition ?',
    },
    {
      eventId: event.id,
      language: 'fr',
      questionId: questions[2].id,
      positive: 'Qui',
      negative: 'Non',
      description: "Assure-toi de lire nos règles. Es-tu d'accord ?",
    },
  ]);

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

  await accountModel.bulkCreate([
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
  ]);

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
      waiting_list: false,
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

  const projects = await projectModel.bulkCreate([
    { name: 'Test Project 1', eventId: event.id, language: 'en', description: 'Test Description 1', maxVoucher: 3 },
    { name: 'Test Project 2', eventId: event.id, language: 'en', description: 'Test Description 2', maxVoucher: 3 },
    { name: 'Test Project 3', eventId: event.id, language: 'nl', description: 'Test Description 3', maxVoucher: 2 },
    { name: 'Test Project 4', eventId: event.id, language: 'nl', description: 'Test Description 4', maxVoucher: 5 },
    { name: 'Test Project 5', eventId: event.id, language: 'fr', description: 'Test Description 5', maxVoucher: 3, deletedAt: new Date() }
  ]);

  const users = await userModel.bulkCreate([
    { eventId: event.id, email: 'user1@user.be', firstname: 'User 1', lastname: 'User 1', sex: 'M', language: 'en', birthmonth: new Date(new Date().getFullYear() - 7, 0, 1), postalcode: '1000', municipality_name: 'Brussel', phone: '+32 470 00 00 01', guardian_firstname: 'Guardian 1', guardian_lastname: 'User 1', guardian_email: 'guardian1@user.be', guardian_phone: '+32 470 10 00 01' },
    { eventId: event.id, email: 'user2@user.be', firstname: 'User 2', lastname: 'User 2', sex: 'F', language: 'nl', birthmonth: new Date(new Date().getFullYear() - 12, 0, 1), postalcode: '2000', municipality_name: 'Antwerpen', phone: '+32 470 00 00 02', guardian_firstname: 'Guardian 2', guardian_lastname: 'User 2', guardian_email: 'guardian2@user.be', guardian_phone: '+32 470 10 00 02' },
    { eventId: event.id, email: 'user3@user.be', firstname: 'User 3', lastname: 'User 3', sex: 'F', language: 'nl', birthmonth: new Date(new Date().getFullYear() - 15, 0, 1), postalcode: '3000', municipality_name: 'Leuven', phone: '+32 470 00 00 03', guardian_firstname: 'Guardian 3', guardian_lastname: 'User 3', guardian_email: 'guardian3@user.be', guardian_phone: '+32 470 10 00 03' },
    { eventId: event.id, email: 'user4@user.be', firstname: 'User 4', lastname: 'User 4', sex: 'X', language: 'fr', birthmonth: new Date(new Date().getFullYear() - 16, 0, 1), postalcode: '4000', municipality_name: 'Luik', phone: '+32 470 00 00 04' },
    { eventId: event.id, email: 'user5@user.be', firstname: 'User 5', lastname: 'User 5', sex: 'X', language: 'fr', birthmonth: new Date(new Date().getFullYear() - 18, 0, 1), postalcode: '5000', municipality_name: 'Namen', phone: '+32 470 00 00 05' }
  ])

  await userProjectModel.bulkCreate([
    { eventId: event.id, isOwner: true, projectId: projects[0].id, userId: users[0].id },
    { eventId: event.id, isOwner: false, projectId: projects[0].id, userId: users[1].id, voucherGuid: '1' },
    { eventId: event.id, isOwner: true, projectId: projects[1].id, userId: users[2].id },
    { eventId: event.id, isOwner: true, projectId: projects[2].id, userId: users[3].id },
    { eventId: event.id, isOwner: true, projectId: projects[3].id, userId: users[4].id, deletedAt: new Date() },
  ])

  await attachmentModel.bulkCreate([
    { eventId: event.id, projectId: projects[0].id, filepath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, '1.png'), name: 'attachment 1', mimetype: 'image/png', thumbnailPath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, 'thumbnail_1.png') },
    { eventId: event.id, projectId: projects[0].id, filepath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, '2.png'), name: 'attachment 2', mimetype: 'image/png', thumbnailPath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, 'thumbnail_2.png'), confirmed: true },
    { eventId: event.id, projectId: projects[0].id, filepath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, '3.png'), name: 'attachment 3', mimetype: 'image/png', thumbnailPath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, 'thumbnail_3.png'), internal: true },
    { eventId: event.id, projectId: projects[0].id, filepath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, '4.png'), name: 'attachment 4', mimetype: 'image/png', thumbnailPath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, 'thumbnail_4.png') },
    { eventId: event.id, projectId: projects[0].id, filepath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, '5.png'), name: 'attachment 5', mimetype: 'image/png', thumbnailPath: path.join(process.env.UPLOAD_ROOT!, event.folderName, `project_${projects[0].id}`, 'thumbnail_5.png') }
  ])

}
