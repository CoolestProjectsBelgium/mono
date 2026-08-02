import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import {
  Event,
  Project,
  Question,
  QuestionRegistration,
  QuestionUser,
  Registration,
  User,
  UserProject,
} from '@coolestprojects/database';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let userProjectFindOne: jest.Mock;

  beforeEach(async () => {
    userProjectFindOne = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: MailerService, useValue: {} },
        { provide: TokensService, useValue: {} },
        { provide: getConnectionToken(), useValue: {} },
        { provide: getModelToken(Event), useValue: {} },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(Registration), useValue: {} },
        { provide: getModelToken(User), useValue: {} },
        { provide: getModelToken(Question), useValue: {} },
        { provide: getModelToken(QuestionUser), useValue: {} },
        { provide: getModelToken(QuestionRegistration), useValue: {} },
        {
          provide: getModelToken(UserProject),
          useValue: { findOne: userProjectFindOne },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('assignParticipant', () => {
    it('rejects when user already has a project', async () => {
      userProjectFindOne.mockResolvedValueOnce({ id: 1, userId: 42 });

      await expect(service.assignParticipant(42, 'voucher-guid')).rejects.toThrow(
        'User already has a project',
      );
    });

    it('rejects when voucher is invalid or already used', async () => {
      userProjectFindOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.assignParticipant(42, 'bad-token')).rejects.toThrow(
        'Project not found or already assigned',
      );
    });

    it('assigns user to unused voucher', async () => {
      const update = jest.fn().mockResolvedValue(undefined);
      userProjectFindOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 7, update });

      await service.assignParticipant(42, 'valid-voucher');

      expect(update).toHaveBeenCalledWith({ userId: 42 });
    });
  });
});
