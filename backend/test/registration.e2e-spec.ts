import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
          .overrideInterceptor(InfoInterceptor)
          .useValue(mockInterceptor)
          .compile();
  
        app = moduleFixture.createNestApplication();
        app.useGlobalInterceptors(mockInterceptor);
        await app.init();
      },
      1 * 60 * 1000,
    );

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
      .set('Accept-Language', 'en-US'); //TODO test all languages

    expect(response.status).toBe(201);

    // check if mail was sent
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@test.be,test1@test.be',
        subject: expect.stringContaining('Registration Confirmation'),
      }),
    );

    // get the registration token from the acitivation mail
    const jwtRegex = /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g;
    const matches = sendMailMock.mock.calls[0][0].text.match(jwtRegex);
    expect(matches).not.toBeNull();

    response = await request(app.getHttpServer())
      .get('/projectinfo')
      .set('Authorization', matches[0])
      .set('Accept-Language', 'en-US'); //TODO test all

    expect(response.status).toBe(200);

    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toMatch(/jwt=eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+; .*/); // Check if the JWT cookie is set

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@test.be,test1@test.be',
        subject: expect.stringContaining('Registration Activation'),
      }),
    );
  });

  it('register project without guardian', () => {});

  it('register project participant to young', () => {});

  it('register project participant to to old', () => {});

  it('register project with incorrect data', () => {});

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