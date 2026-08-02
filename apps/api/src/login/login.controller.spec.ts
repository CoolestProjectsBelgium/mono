import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { getModelToken } from '@nestjs/sequelize';
import { LoginController } from './login.controller';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { User, Registration } from '@coolestprojects/database';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('LoginController', () => {
  let controller: LoginController;
  const registrationService = {
    activateRegistration: jest.fn(),
  };
  const tokensService = {
    generateLoginToken: jest.fn().mockReturnValue('login-jwt'),
    generateRegistrationToken: jest.fn().mockReturnValue('registration-jwt'),
  };
  const mailerService = {
    loginMail: jest.fn(),
    registrationMail: jest.fn(),
  };
  const userModel = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };
  const registrationModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        { provide: RegistrationService, useValue: registrationService },
        { provide: TokensService, useValue: tokensService },
        { provide: MailerService, useValue: mailerService },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(Registration), useValue: registrationModel },
        UserCookieInterceptor,
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('activates login for returning users', async () => {
    const user = { id: 7, language: 'nl' };
    (verify as jest.Mock).mockReturnValue({ userID: 7 });
    userModel.findByPk.mockResolvedValue(user);

    const req: { user?: User } = {};
    const result = await controller.activateLogin({ jwt: 'token' }, req);

    expect(result.language).toBe('nl');
    expect(req.user).toBe(user);
  });

  it('rejects invalid login tokens', async () => {
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(
      controller.activateLogin({ jwt: 'bad' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('sends login mail for known users', async () => {
    const user = { id: 3, email: 'user@example.com', language: 'en' };
    userModel.findOne.mockResolvedValue(user);

    const result = await controller.mailToken({ email: 'user@example.com' });

    expect(mailerService.loginMail).toHaveBeenCalledWith(user, 'login-jwt');
    expect(result.language).toBe('en');
  });
});
