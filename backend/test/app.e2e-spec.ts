import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { seedDatabase } from '../src/seeder/seed';
import { Event } from '../src/models/event.model';
import { TshirtGroup } from '../src/models/tshirt_group.model';
import { Question } from '../src/models/question.model';
import { QuestionTranslation } from '../src/models/question_translation.model';
import { Tshirt } from '../src/models/tshirt.model';
import { Location } from '../src/models/location.model';
import { TshirtGroupTranslation } from '../src/models/tshirt_group_translation.model';
import { EventTable } from '../src/models/event_table.model';
import { EmailTemplate } from '../src/models/email_template.model';
import { TshirtTranslation } from '../src/models/tshirt_translation.model';
//import { RegistrationService } from '../src/registration/registration.service';
//import { ParticipantService } from '../src/participant/participant.service';
//import { TokensService } from '../src/tokens/tokens.service';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { InfoInterceptor } from '../src/info.interceptor';
import { MockInfoInterceptor } from './mock-info.interceptor'; // Import your mock interceptor

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

  beforeAll(
    async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [],
      })
        .overrideInterceptor(InfoInterceptor)
        .useClass(
          new MockInfoInterceptor({
            currentEvent: 1,
            language: 'en',
            closed: false,
            current: true,
            projectClosed: false,
            registationClosed: false,
            registrationOpen: true,
          }),
        )
        .compile();

      app = moduleFixture.createNestApplication();
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
    },
    1 * 60 * 1000,
  );

  it('/settings (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings')
      .expect(200)
      .expect(
        '{"maxAge":18,"minAge":7,"guardianAge":16,"enviroment":"production","waitingListActive":false,"maxUploadSize":2147483647,"startDateEvent":"2024-09-01T00:00:00.000Z","tshirtDate":"2025-04-01T00:00:00.000Z","eventBeginDate":"2024-09-01T00:00:00.000Z","registrationOpenDate":"2024-11-01T00:00:00.000Z","registrationClosedDate":"2025-04-01T00:00:00.000Z","projectClosedDate":"2025-04-12T00:00:00.000Z","officialStartDate":"2025-04-26T00:00:00.000Z","eventEndDate":"2025-08-31T00:00:00.000Z","eventTitle":"Coolest Projects 2025","maxRegistration":64,"maxParticipants":3,"isRegistrationOpen":false,"isProjectClosed":true,"isActive":true}',
      );
  });

  it('/tshirts (GET)', () => {
    return request(app.getHttpServer())
      .get('/tshirts')
      .set('Accept-Language', 'en-US') //TODO test all languages
      .expect(200)
      .expect(
        '[{"group":"kids","items":[{"id":1,"name":"kid_3-4"},{"id":2,"name":"kid_5-6"},{"id":3,"name":"kid_7-8"},{"id":4,"name":"kid_9-11"},{"id":5,"name":"kid_12-14"}]},{"group":"adults","items":[{"id":6,"name":"adult_XXS"},{"id":7,"name":"adult_XS"},{"id":8,"name":"adult_S"},{"id":9,"name":"adult_M"},{"id":10,"name":"adult_L"},{"id":11,"name":"adult_XL"},{"id":12,"name":"adult_XXL"},{"id":13,"name":"adult_3XL"},{"id":14,"name":"adult_4XL"},{"id":15,"name":"adult_5XL"}]}]',
      );
  });

  it('/questions (GET)', () => {
    return request(app.getHttpServer())
      .get('/questions')
      .set('Accept-Language', 'en-US') //TODO test all languages
      .expect(200)
      .expect(
        '[{"id":1,"name":"Agree to Photo","description":"It is possible that the participant is photographed or filmed","positive":"That is no problem","negative":"Don\'t use any pictures or movies where the participant is reconizable"},{"id":2,"name":"Agree to Contact","description":"Can CoderDojo contact you for the next edition","positive":"Yes","negative":"No"}]',
      );
  });

  it('/approvals (GET)', () => {
    return request(app.getHttpServer())
      .get('/approvals')
      .set('Accept-Language', 'en-US') //TODO test all languages
      .expect(200)
      .expect(
        '[{"id":3,"name":"Approved","description":"Be sure to read our rules. Do you agree"}]',
      );
  });

  it('register project with guardian', () => {
    return request(app.getHttpServer())
      .post('/registration')
      .send({
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
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2010,
          month: 5,
          t_size: 1, // kid_3-4
          via: '',
          medical: '',
          email_guardian: 'test1@test.be',
          gsm_guardian: '0987654321',
          gsm: '1234567890',
          sex: 'x',
        },
        project: {
          own_project: {
            project_name: 'Test Project',
            project_descr: 'This is a test project',
            project_type: 'test',
            project_lang: 'en',
          },
        },
      })
      .set('Accept-Language', 'en-US') //TODO test all languages
      .expect(201)
  });

  it('register project without guardian', () => {});

  it('register project participant to young', () => {});

  it('register project participant to to old', () => {});

  it('register project with incorrect data', () => {});

  it('register participant on project', () => {});

  it('register participant with incorrect token', () => {});

  it('register project on waiting list', () => {});

  it('register participant when waiting list is active', () => {});

  it('register project when event is closed', () => {});

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
