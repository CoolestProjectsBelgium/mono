import type { Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { verify } from 'jsonwebtoken';
import { getModelToken } from '@nestjs/sequelize';
import { LoginController } from './login.controller';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { User, Registration } from '@coolestprojects/database';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

describe('LoginController', () => {
  let controller: LoginController;
  const registrationService = {
    activateRegistration: vi.fn(),
  };
  const tokensService = {
    generateLoginToken: vi.fn().mockReturnValue('login-jwt'),
    generateRegistrationToken: vi.fn().mockReturnValue('registration-jwt'),
  };
  const mailerService = {
    loginMail: vi.fn(),
    registrationMail: vi.fn(),
  };
  const userModel = {
    findByPk: vi.fn(),
    findOne: vi.fn(),
  };
  const registrationModel = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
      controllers: [LoginController],
      providers: [
        { provide: RegistrationService, useValue: registrationService },
        { provide: TokensService, useValue: tokensService },
        { provide: MailerService, useValue: mailerService },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(Registration), useValue: registrationModel },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
            getOrThrow: vi.fn().mockReturnValue('test-jwt-secret'),
          },
        },
        UserCookieInterceptor,
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('activates login for returning users', async () => {
    const user = { id: 7, language: 'nl' };
    (verify as Mock).mockReturnValue({ userID: 7 });
    userModel.findByPk.mockResolvedValue(user);

    const req: { user?: User } = {};
    const result = await controller.activateLogin({ jwt: 'token' }, req);

    expect(result.language).toBe('nl');
    expect(req.user).toBe(user);
  });

  it('rejects invalid login tokens', async () => {
    (verify as Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(
      controller.activateLogin({ jwt: 'bad' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not set session when registration token was already consumed', async () => {
    (verify as Mock).mockReturnValue({ registrationID: 13 });
    registrationService.activateRegistration.mockRejectedValue(
      new ConflictException('Registration already activated'),
    );

    const req: { user?: User } = {};
    await expect(
      controller.activateLogin({ jwt: 'used-token' }, req),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(req.user).toBeUndefined();
  });

  it('sends login mail for known users', async () => {
    const user = { id: 3, email: 'user@example.com', language: 'en' };
    userModel.findOne.mockResolvedValue(user);

    const result = await controller.mailToken({ email: 'user@example.com' });

    expect(mailerService.loginMail).toHaveBeenCalledWith(user, 'login-jwt');
    expect(result.language).toBe('en');
  });
});
