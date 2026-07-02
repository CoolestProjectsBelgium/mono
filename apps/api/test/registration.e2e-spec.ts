import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { InfoInterceptor } from '../src/info.interceptor';
import { MockInfoInterceptor } from './mock-info.interceptor'; // Import your mock interceptor
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe('RegistrationController (e2e)', () => {
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
        .overrideProvider(APP_INTERCEPTOR)
        .useValue(mockInterceptor)
        .compile();

      app = moduleFixture.createNestApplication();
      app.use(cookieParser(process.env.JWT_KEY));
      app.getHttpAdapter().getInstance().set('trust proxy', 1);
      await app.init();
    },
    1 * 60 * 1000,
  );

  it('register co-worker via voucher token activates login', async () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    const ownerEmail = `owner-${Date.now()}@test.be`;
    const ownerRegister = await request(app.getHttpServer())
      .post('/registration')
      .send({
        user: {
          email: ownerEmail,
          firstname: 'Owner',
          lastname: 'User',
          address: {
            postalcode: 1000,
            municipality_name: 'Bruxelles',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2008,
          month: 5,
          t_size: 3,
          via: '',
          medical: '',
          email_guardian: '',
          gsm_guardian: '',
          gsm: '0470123456',
          sex: 'x',
        },
        project: {
          own_project: {
            project_name: 'Owner Project',
            project_descr: 'Owner project',
            project_type: 'test',
            project_lang: 'en',
          },
        },
      })
      .set('Accept-Language', 'en-US');
    expect(ownerRegister.status).toBe(201);

    const ownerMail = sendMailMock.mock.calls[sendMailMock.mock.calls.length - 1][0];
    const ownerTokenMatch = ownerMail.text.match(/login\?token=([^"\s]+)/);
    expect(ownerTokenMatch).not.toBeNull();
    const ownerToken = decodeURIComponent(ownerTokenMatch![1]);

    const ownerAgent = request.agent(app.getHttpServer());
    const ownerLogin = await ownerAgent
      .post('/login')
      .send({ jwt: ownerToken })
      .set('Accept-Language', 'en-US');
    expect(ownerLogin.status).toBe(201);

    sendMailMock.mockClear();
    const voucherResponse = await ownerAgent
      .post('/participant')
      .set('Accept-Language', 'en-US');
    expect(voucherResponse.status).toBe(201);
    expect(voucherResponse.body.token).toBeDefined();

    const coworkerEmail = `coworker-${Date.now()}@test.be`;
    const coworkerRegister = await request(app.getHttpServer())
      .post('/registration')
      .send({
        user: {
          email: coworkerEmail,
          firstname: 'Co',
          lastname: 'Worker',
          address: {
            postalcode: 1000,
            municipality_name: 'Bruxelles',
            street: 'Test Street',
            house_number: '2',
            box_number: 'B',
          },
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2012,
          month: 6,
          t_size: 1,
          via: '',
          medical: '',
          email_guardian: 'guardian@test.be',
          gsm_guardian: '0987654321',
          gsm: '1234567890',
          sex: 'x',
        },
        project: {
          other_project: {
            project_code: voucherResponse.body.token,
          },
        },
      })
      .set('Accept-Language', 'en-US');
    expect(coworkerRegister.status).toBe(201);

    const coworkerMail = sendMailMock.mock.calls[sendMailMock.mock.calls.length - 1][0];
    const coworkerTokenMatch = coworkerMail.text.match(/login\?token=([^"\s]+)/);
    expect(coworkerTokenMatch).not.toBeNull();
    const coworkerToken = decodeURIComponent(coworkerTokenMatch![1]);

    const coworkerAgent = request.agent(app.getHttpServer());
    const coworkerLogin = await coworkerAgent
      .post('/login')
      .send({ jwt: coworkerToken })
      .set('Accept-Language', 'en-US');

    expect(coworkerLogin.status).toBe(201);
    expect(coworkerLogin.headers['set-cookie']).toBeDefined();

    const userinfoResponse = await coworkerAgent
      .get('/userinfo')
      .set('Accept-Language', 'en-US');

    expect(userinfoResponse.status).toBe(200);
    expect(userinfoResponse.body.email).toBe(coworkerEmail);
    expect(userinfoResponse.body.firstname).toBe('Co');

    const projectinfoResponse = await coworkerAgent
      .get('/projectinfo')
      .set('Accept-Language', 'en-US');

    expect(projectinfoResponse.status).toBe(200);
    expect(projectinfoResponse.body.own_project.project_name).toBe('Owner Project');
    expect(projectinfoResponse.body.is_owner).toBe(false);

    const leaveResponse = await coworkerAgent
      .delete('/participant/self')
      .set('Accept-Language', 'en-US');
    expect(leaveResponse.status).toBe(200);
    expect(leaveResponse.body.success).toBe(true);

    const coworkerProjectAfterLeave = await coworkerAgent
      .get('/projectinfo')
      .set('Accept-Language', 'en-US');
    expect(coworkerProjectAfterLeave.status).toBeGreaterThanOrEqual(400);

    const ownerProjectAfterLeave = await ownerAgent
      .get('/projectinfo')
      .set('Accept-Language', 'en-US');
    expect(ownerProjectAfterLeave.status).toBe(200);
    const pendingParticipant = ownerProjectAfterLeave.body.own_project.participants.find(
      (participant: { status: string }) => participant.status === 'pending',
    );
    expect(pendingParticipant).toBeDefined();
    expect(pendingParticipant.token).toBe(voucherResponse.body.token);
  });

  it('register project with guardian', async () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    let response = await request(app.getHttpServer())
      .post('/registration')
      .send({
        user: {
          email: `test-${Date.now()}@test.be`,
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Bruxelles',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2012,
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
      .set('Accept-Language', 'en-US'); //TODO test all languages

    expect(response.status).toBe(201);

    // check if mail was sent
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringMatching(/test-\d+@test\.be,test1@test\.be/),
        subject: expect.stringContaining('Coolest Projects'),
      }),
    );

    const firstMail = sendMailMock.mock.calls[0][0];
    expect(firstMail.text).toContain('/login?token=');
    expect(firstMail.html).toContain('/login?token=');

    const tokenMatch = firstMail.text.match(/login\?token=([^"\s]+)/);
    expect(tokenMatch).not.toBeNull();
    const token = decodeURIComponent(tokenMatch![1]);

    const agent = request.agent(app.getHttpServer());
    const loginResponse = await agent
      .post('/login')
      .send({ jwt: token })
      .set('Accept-Language', 'en-US');

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.headers['set-cookie']).toBeDefined();
    expect(loginResponse.headers['set-cookie'][0]).toMatch(
      /^jwt=s(?::|%3A)eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,
    );

    response = await agent
      .get('/projectinfo')
      .set('Accept-Language', 'en-US');

    expect(response.status).toBe(200);

    const userinfoResponse = await agent
      .get('/userinfo')
      .set('Accept-Language', 'en-US');

    expect(userinfoResponse.status).toBe(200);
    expect(userinfoResponse.body.firstname).toBe('John');
    expect(userinfoResponse.body.lastname).toBe('Doe');
    expect(userinfoResponse.body.address.postalcode).toBe(1000);
    expect(userinfoResponse.body.address.municipality_name).toBe('Bruxelles');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringMatching(/test-\d+@test\.be,test1@test\.be/),
        subject: expect.stringContaining('Coolest Projects'),
      }),
    );
  });

  it('duplicate registration sends emailExists mail', async () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    const email = `dup-${Date.now()}@test.be`;
    const payload = {
      user: {
        email,
        firstname: 'Dup',
        lastname: 'User',
        address: {
          postalcode: 1000,
          municipality_name: 'Bruxelles',
          street: 'Test Street',
          house_number: '1',
          box_number: 'A',
        },
        general_questions: [],
        mandatory_approvals: [3],
        language: 'en',
        year: 2012,
        month: 5,
        t_size: 1,
        via: '',
        medical: '',
        email_guardian: '',
        gsm_guardian: '',
        gsm: '1234567890',
        sex: 'x',
      },
      project: {
        own_project: {
          project_name: 'Dup Project',
          project_descr: 'Dup',
          project_type: 'test',
          project_lang: 'en',
        },
      },
    };

    sendMailMock.mockClear();
    const first = await request(app.getHttpServer())
      .post('/registration')
      .send(payload)
      .set('Accept-Language', 'en-US');
    expect(first.status).toBe(201);

    sendMailMock.mockClear();
    const second = await request(app.getHttpServer())
      .post('/registration')
      .send(payload)
      .set('Accept-Language', 'en-US');
    expect(second.status).toBe(201);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Coolest Projects'),
      }),
    );
  });

  it('register project without guardian', async () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    const response = await request(app.getHttpServer())
      .post('/registration')
      .send({
        user: {
          email: `adult-${Date.now()}@test.be`,
          firstname: 'Jane',
          lastname: 'Doe',
          address: {
            postalcode: 1000,
            municipality_name: 'Bruxelles',
            street: 'Test Street',
            house_number: '1',
            box_number: 'A',
          },
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2008,
          month: 5,
          t_size: 3,
          via: '',
          medical: '',
          email_guardian: '',
          gsm_guardian: '',
          gsm: '0470123456',
          sex: 'x',
        },
        project: {
          own_project: {
            project_name: 'Adult Project',
            project_descr: 'No guardian needed',
            project_type: 'test',
            project_lang: 'en',
          },
        },
      })
      .set('Accept-Language', 'en-US');

    expect(response.status).toBe(201);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringMatching(/adult-\d+@test\.be/),
        subject: expect.stringContaining('Coolest Projects'),
      }),
    );
  });

  it('register project participant to young', () => {});

  it('register project participant to to old', () => {});

  it('register project with incorrect data', async () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: true,
    });

    const response = await request(app.getHttpServer())
      .post('/registration')
      .send({
        user: {
          email: `invalid-postal-${Date.now()}@test.be`,
          firstname: 'John',
          lastname: 'Doe',
          address: {
            postalcode: 0,
            municipality_name: '',
            street: '',
            house_number: '',
            box_number: '',
          },
          general_questions: [],
          mandatory_approvals: [3],
          language: 'en',
          year: 2008,
          month: 5,
          t_size: 2,
          via: '',
          medical: '',
          gsm_guardian: '',
          email_guardian: '',
          gsm: '0470123456',
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
      .set('Accept-Language', 'en-US');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Postal code must be a valid Belgian postcode');
  });

  it('register participant on project', () => {});

  it('register participant with incorrect token', () => {});

  it('register project on waiting list', () => {});

  it('register participant when waiting list is active', () => {});

  it('register project when event is closed', () => {
    mockInterceptor.setInfo({
      currentEvent: 1,
      language: 'en',
      closed: false,
      current: true,
      projectClosed: false,
      registrationOpen: false, // simulate closed registration
    });

    return request(app.getHttpServer())
      .post('/registration')
      .send({}) // first validation is always event
      .set('Accept-Language', 'en-US') //TODO test all languages
      .expect(500);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
