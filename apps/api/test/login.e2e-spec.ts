import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { MockInfoInterceptor } from './mock-info.interceptor';
import { TokensService } from '../src/tokens/tokens.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe('LoginController (e2e)', () => {
  let app: INestApplication;
  let mockInterceptor: MockInfoInterceptor;
  let tokensService: TokensService;
  let userModel: typeof User;

  beforeAll(async () => {
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
    })
      .overrideProvider(APP_INTERCEPTOR)
      .useValue(mockInterceptor)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser(process.env.JWT_KEY));
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    await app.init();

    tokensService = moduleFixture.get(TokensService);
    userModel = moduleFixture.get(getModelToken(User));
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /login activates a userID token and sets jwt cookie', async () => {
    const user = await userModel.create({
      email: `login-e2e-${Date.now()}@test.be`,
      firstname: 'Login',
      lastname: 'User',
      language: 'nl',
      eventId: 1,
      postalcode: 1000,
      sex: 'x',
      tshirtId: 1,
    } as any);

    const token = tokensService.generateLoginToken(user.id);
    const agent = request.agent(app.getHttpServer());

    const loginResponse = await agent
      .post('/login')
      .send({ jwt: token })
      .set('Accept-Language', 'nl');

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body.expires).toBeDefined();
    expect(loginResponse.body.language).toBe('nl');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
    expect(loginResponse.headers['set-cookie'][0]).toMatch(
      /^jwt=s(?::|%3A)eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,
    );

    const userinfoResponse = await agent
      .get('/userinfo')
      .set('Accept-Language', 'nl');

    expect(userinfoResponse.status).toBe(200);
    expect(userinfoResponse.body.email).toBe(user.email);
    expect(userinfoResponse.body.firstname).toBe('Login');
  });

  it('POST /login rejects an invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ jwt: 'not-a-valid-jwt' });

    expect(response.status).toBe(401);
  });
});
