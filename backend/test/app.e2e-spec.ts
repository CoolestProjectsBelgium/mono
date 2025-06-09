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
//import { RegistrationService } from '../src/registration/registration.service';
//import { ParticipantService } from '../src/participant/participant.service';
//import { TokensService } from '../src/tokens/tokens.service';
import { getModelToken } from '@nestjs/sequelize';
import { env } from 'process';
//import { MailerService } from '../src/mailer/mailer.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    console.log(env);

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
      //app.get<RegistrationService>(RegistrationService),
      //app.get<ParticipantService>(ParticipantService),
      //app.get<TokensService>(TokensService),
    );
  });

  it('/settings (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings')
      .expect(200)
      .expect(
        '{"maxAge":18,"minAge":7,"guardianAge":16,"enviroment":"production","waitingListActive":false,"maxUploadSize":2147483647,"startDateEvent":"2024-09-01T00:00:00.000Z","tshirtDate":"2025-04-01T00:00:00.000Z","isActive":true,"eventBeginDate":"2024-09-01T00:00:00.000Z","registrationOpenDate":"2024-11-01T00:00:00.000Z","registrationClosedDate":"2025-04-01T00:00:00.000Z","projectClosedDate":"2025-04-12T00:00:00.000Z","officialStartDate":"2025-04-26T00:00:00.000Z","eventEndDate":"2025-08-31T00:00:00.000Z","eventTitle":"Coolest Projects 2025","isRegistrationOpen":false,"isProjectClosed":true,"maxRegistration":64,"maxParticipants":3}',
      );
  });

  afterAll(async () => {
    if (app) {
      await app.close(); // VERY important
    }
  });
});
