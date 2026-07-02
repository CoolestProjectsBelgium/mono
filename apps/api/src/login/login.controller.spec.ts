import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { LoginController } from './login.controller';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { User, Registration } from '@coolestprojects/database';

describe('LoginController', () => {
  let controller: LoginController;
  let loginMail: jest.Mock;
  let registrationMail: jest.Mock;
  let activateRegistration: jest.Mock;
  let userModel: { findOne: jest.Mock; findByPk: jest.Mock };

  const jwtKey = 'test-login-controller-key';

  beforeEach(async () => {
    process.env.JWT_KEY = jwtKey;
    loginMail = jest.fn();
    registrationMail = jest.fn();
    activateRegistration = jest.fn();
    userModel = { findOne: jest.fn(), findByPk: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: RegistrationService,
          useValue: { activateRegistration },
        },
        {
          provide: TokensService,
          useValue: {
            generateLoginToken: jest.fn().mockReturnValue('token'),
            generateRegistrationToken: jest.fn().mockReturnValue('token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            loginMail,
            registrationMail,
          },
        },
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
        {
          provide: getModelToken(Registration),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('activateLogin resolves userID tokens', async () => {
    const user = { id: 1, language: 'nl' } as User;
    userModel.findByPk.mockResolvedValue(user);
    const jwt = sign({ userID: 1 }, jwtKey);
    const req: { user?: User } = {};

    const result = await controller.activateLogin({ jwt }, req);

    expect(userModel.findByPk).toHaveBeenCalledWith(1);
    expect(req.user).toBe(user);
    expect(result.language).toBe('nl');
    expect(result.expires).toBeInstanceOf(Date);
  });

  it('activateLogin resolves registrationID tokens', async () => {
    const user = { id: 2, language: 'en' } as User;
    activateRegistration.mockResolvedValue(user);
    const jwt = sign({ registrationID: 42 }, jwtKey);
    const req: { user?: User } = {};

    const result = await controller.activateLogin({ jwt }, req);

    expect(activateRegistration).toHaveBeenCalledWith(42);
    expect(req.user).toBe(user);
    expect(result.language).toBe('en');
  });

  it('activateLogin rejects invalid tokens', async () => {
    await expect(
      controller.activateLogin({ jwt: 'invalid' }, {} as { user?: User }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('activateLogin rejects when user is not found', async () => {
    userModel.findByPk.mockResolvedValue(null);
    const jwt = sign({ userID: 999 }, jwtKey);

    await expect(
      controller.activateLogin({ jwt }, {} as { user?: User }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('mailToken calls loginMail for existing users', async () => {
    userModel.findOne.mockResolvedValue({
      id: 1,
      email: 'user@test.be',
      language: 'en',
    });

    await controller.mailToken({ email: 'user@test.be' });

    expect(loginMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.be' }),
      'token',
    );
    expect(registrationMail).not.toHaveBeenCalled();
  });
});
