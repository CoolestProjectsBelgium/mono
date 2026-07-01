import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { LoginController } from './login.controller';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { User, Registration } from '@coolestprojects/database';

describe('LoginController', () => {
  let controller: LoginController;
  let loginMail: jest.Mock;
  let registrationMail: jest.Mock;
  let userModel: { findOne: jest.Mock; findByPk: jest.Mock };

  beforeEach(async () => {
    loginMail = jest.fn();
    registrationMail = jest.fn();
    userModel = { findOne: jest.fn(), findByPk: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: RegistrationService,
          useValue: { activateRegistration: jest.fn() },
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
