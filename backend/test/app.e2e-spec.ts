import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
//import { RegistrationService } from '../src/registration/registration.service';
//import { ParticipantService } from '../src/participant/participant.service';
//import { TokensService } from '../src/tokens/tokens.service';
import { InfoInterceptor } from '../src/info.interceptor';
import { MockInfoInterceptor } from './mock-info.interceptor'; // Import your mock interceptor
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

// TODO include this
/*
    const r = await registrationService.create(
      {
        currentEvent: event.id,
        language: 'en',
      },
      {
        user: {
          email: 'test@test.be',
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Test City',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          language: 'en',
          email_guardian: 'guardian@test.be',
          gsm: '1234567890',
          gsm_guardian: '0987654321',
          general_questions: [],
          mandatory_approvals: [questions[2].id],
          sex: 'x',
          year: 2010,
          month: 5,
          t_size: tshirts[1].id,
          via: '',
          medical: '',
        },
        project: {
          own_project: {
            project_name: 'Test Project',
            project_descr: 'This is a test project',
            project_type: 'test',
            project_lang: 'en',
          },
        },
      },
    );

    const token = tokenService.generateRegistrationToken(r.id);
    const user = await registrationService.activateRegistration(token);
    
    const voucher = await participantService.generateParticipantVoucher(user.id);
    const r1 = await registrationService.create(
      {
        currentEvent: event.id,
        language: 'en',
      },
      {
        user: {
          email: 'test1@test.be',
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Test City',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          language: 'en',
          email_guardian: 'guardian1@test.be',
          gsm: '1234567890',
          gsm_guardian: '0987654321',
          general_questions: [],
          mandatory_approvals: [questions[2].id],
          sex: 'x',
          year: 2010,
          month: 5,
          t_size: tshirts[2].id,
          via: '',
          medical: '',
        },
        project: {
          other_project: {
            project_code: voucher.voucherGuid,
          },
        },
      },
    );

    const token1 = tokenService.generateRegistrationToken(r1.id);
    await registrationService.activateRegistration(token1);
    */

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockInterceptor: MockInfoInterceptor;

  beforeAll(
    async () => {
      mockInterceptor = new MockInfoInterceptor({
        currentEvent: 1,
        language: 'en',
        closed: false,
        current: true,
        projectClosed: false,
        registrationOpen: true,
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [],
      })
        .overrideInterceptor(InfoInterceptor)
        .useValue(mockInterceptor)
        .compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalInterceptors(mockInterceptor);
      await app.init();
    },
    1 * 60 * 1000,
  );

  it('/settings (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings')
      .expect(200)
      .expect(
        '{"maxAge":18,"minAge":7,"guardianAge":16,"enviroment":"production","waitingListActive":false,"maxUploadSize":2147483647,"startDateEvent":"2024-09-01T00:00:00.000Z","tshirtDate":"2025-04-01T00:00:00.000Z","eventBeginDate":"2024-09-01T00:00:00.000Z","registrationOpenDate":"2024-11-01T00:00:00.000Z","registrationClosedDate":"2025-04-01T00:00:00.000Z","projectClosedDate":"2025-04-12T00:00:00.000Z","officialStartDate":"2025-04-26T00:00:00.000Z","eventEndDate":"2025-08-31T00:00:00.000Z","eventTitle":"Coolest Projects 2025","maxRegistration":64,"maxParticipants":3,"isRegistrationOpen":true,"isProjectClosed":false,"isActive":true}',
      );
  });

  //TODO: Add other paths for /settings (GET) ????

  // Test for /tshirts (GET)
  const expected_tshirts_outputs = {
    "en": '[{"group":"kids","items":[{"id":1,"name":"kid_3-4"},{"id":2,"name":"kid_5-6"},{"id":3,"name":"kid_7-8"},{"id":4,"name":"kid_9-11"},{"id":5,"name":"kid_12-14"}]},{"group":"adults","items":[{"id":6,"name":"adult_XXS"},{"id":7,"name":"adult_XS"},{"id":8,"name":"adult_S"},{"id":9,"name":"adult_M"},{"id":10,"name":"adult_L"},{"id":11,"name":"adult_XL"},{"id":12,"name":"adult_XXL"},{"id":13,"name":"adult_3XL"},{"id":14,"name":"adult_4XL"},{"id":15,"name":"adult_5XL"}]}]',
    "nl": '[{"group":"kind","items":[{"id":1,"name":"kind_3-4"},{"id":2,"name":"kind_5-6"},{"id":3,"name":"kind_7-8"},{"id":4,"name":"kind_9-11"},{"id":5,"name":"kind_12-14"}]},{"group":"volwassen","items":[{"id":6,"name":"volwassen_XXS"},{"id":7,"name":"volwassen_XS"},{"id":8,"name":"volwassen_S"},{"id":9,"name":"volwassen_M"},{"id":10,"name":"volwassen_L"},{"id":11,"name":"volwassen_XL"},{"id":12,"name":"volwassen_XXL"},{"id":13,"name":"volwassen_3XL"},{"id":14,"name":"volwassen_4XL"},{"id":15,"name":"volwassen_5XL"}]}]',
    "fr": '[{"group":"enfants","items":[{"id":1,"name":"enfants_3-4"},{"id":2,"name":"enfants_5-6"},{"id":3,"name":"enfants_7-8"},{"id":4,"name":"enfants_9-11"},{"id":5,"name":"enfants_12-14"}]},{"group":"adulte","items":[{"id":6,"name":"adulte_XXS"},{"id":7,"name":"adulte_XS"},{"id":8,"name":"adulte_S"},{"id":9,"name":"adulte_M"},{"id":10,"name":"adulte_L"},{"id":11,"name":"adulte_XL"},{"id":12,"name":"adulte_XXL"},{"id":13,"name":"adulte_3XL"},{"id":14,"name":"adulte_4XL"},{"id":15,"name":"adulte_5XL"}]}]'
  }

  for (const [lang, expected] of Object.entries(expected_tshirts_outputs)) {
    it(`/tshirts (GET) - ${lang}`, () => {
      mockInterceptor.setLanguage(lang); // Set the language in the mock interceptor
      return request(app.getHttpServer())
        .get('/tshirts')
        .expect(200)
        .expect(expected);
    });
  }

  //TODO: Add wrong event id for /tshirts (GET) ????

  // Test for /questions (GET)
  const expected_questions_outputs = {
    "en": '[{"id":1,"name":"Agree to Photo","description":"It is possible that the participant is photographed or filmed","positive":"That is no problem","negative":"Don\'t use any pictures or movies where the participant is reconizable"},{"id":2,"name":"Agree to Contact","description":"Can CoderDojo contact you for the next edition","positive":"Yes","negative":"No"}]',
    "nl": '[{"id":1,"name":"Agree to Photo","description":"Het is mogelijk dat de deelnemer gefotografeerd of gefilmd wordt","positive":"Dat is geen probleem","negative":"Gelieve geen foto’s en filmpjes te gebruiken waarop de deelnemer herkenbaar is"},{"id":2,"name":"Agree to Contact","description":"Mag CoderDojo je contacteren voor de volgende editie?","positive":"Ja","negative":"Nee"}]',
    "fr": '[{"id":1,"name":"Agree to Photo","description":"Le ou la participant.e peut être photographié.e ou filmé.e.","positive":"Je suis d\'accord","negative":"Je ne suis pas d’accord que l’on utilise les images et vidéos si le ou la participant.e est reconnaissable"},{"id":2,"name":"Agree to Contact","description":"CoderDojo peut-il vous contacter pour la prochaine édition ?","positive":"Qui","negative":"Non"}]'
  }

  for (const [lang, expected] of Object.entries(expected_questions_outputs)) {
    it(`/questions (GET) - ${lang}`, () => {
      mockInterceptor.setLanguage(lang); // Set the language in the mock interceptor
      return request(app.getHttpServer())
        .get('/questions')
        .expect(200)
        .expect(expected);
    });
  }

  //TODO: Add wrong event id for /questions (GET) ????

  // Test for /approvals (GET)
  const expected_approvals_outputs = {
    "en": '[{"id":3,"name":"Approved","description":"Be sure to read our rules. Do you agree"}]',
    "nl": '[{"id":3,"name":"Approved","description":"Lees zeker onze regels. Ga je akkoord?"}]',
    "fr": '[{"id":3,"name":"Approved","description":"Assure-toi de lire nos règles. Es-tu d\'accord ?"}]'
  }

  for (const [lang, expected] of Object.entries(expected_approvals_outputs)) {
    it(`/approvals (GET) - ${lang}`, () => {
      mockInterceptor.setLanguage(lang); // Set the language in the mock interceptor
      return request(app.getHttpServer())
        .get('/approvals')
        .expect(200)
        .expect(expected);
    });
  }

  //TODO: Add wrong event id for /approvals (GET) ????

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
