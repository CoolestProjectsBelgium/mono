import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { LoginController } from './login.controller';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { User, Registration } from '@coolestprojects/database';

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(async () => {
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
            loginMail: jest.fn(),
            registrationMail: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: { findOne: jest.fn(), findByPk: jest.fn() },
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
});
