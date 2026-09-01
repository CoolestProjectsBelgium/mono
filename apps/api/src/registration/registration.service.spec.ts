import { ConflictException } from '@nestjs/common';
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
  Affiliation,
} from '@coolestprojects/database';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let userProjectFindOne: jest.Mock;
  let registrationFindOne: jest.Mock;
  let transactionCommit: jest.Mock;
  let transactionRollback: jest.Mock;
  let projectFindByPk: jest.Mock;
  let projectCreate: jest.Mock;
  let eventFindByPk: jest.Mock;
  let userCreate: jest.Mock;
  let welcomeMailOwner: jest.Mock;
  let welcomeMailCoWorker: jest.Mock;
  let generateLoginToken: jest.Mock;

  beforeEach(async () => {
    userProjectFindOne = jest.fn();
    registrationFindOne = jest.fn();
    transactionCommit = jest.fn().mockResolvedValue(undefined);
    transactionRollback = jest.fn().mockResolvedValue(undefined);
    projectFindByPk = jest.fn();
    projectCreate = jest.fn();
    eventFindByPk = jest.fn();
    userCreate = jest.fn();
    welcomeMailOwner = jest.fn().mockResolvedValue(undefined);
    welcomeMailCoWorker = jest.fn().mockResolvedValue(undefined);
    generateLoginToken = jest.fn().mockReturnValue('login-jwt');

    const transaction = {
      commit: transactionCommit,
      rollback: transactionRollback,
      LOCK: { UPDATE: 'UPDATE' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: MailerService,
          useValue: {
            welcomeMailOwner,
            welcomeMailCoWorker,
            notifyProjectOwner: jest.fn(),
          },
        },
        {
          provide: TokensService,
          useValue: { generateLoginToken },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            transaction: jest.fn().mockResolvedValue(transaction),
          },
        },
        { provide: getModelToken(Event), useValue: { findByPk: eventFindByPk } },
        {
          provide: getModelToken(Project),
          useValue: {
            findByPk: projectFindByPk,
            create: projectCreate,
          },
        },
        {
          provide: getModelToken(Registration),
          useValue: {
            findOne: registrationFindOne,
            destroy: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getModelToken(User),
          useValue: { create: userCreate },
        },
        { provide: getModelToken(Question), useValue: {} },
        { provide: getModelToken(QuestionUser), useValue: { bulkCreate: jest.fn() } },
        {
          provide: getModelToken(QuestionRegistration),
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            destroy: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getModelToken(UserProject),
          useValue: {
            findOne: userProjectFindOne,
            create: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: getModelToken(Affiliation), useValue: {} },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('activateRegistration', () => {
    it('throws ConflictException when registration row was already consumed', async () => {
      registrationFindOne.mockResolvedValue(null);

      await expect(service.activateRegistration(13)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.activateRegistration(13)).rejects.toThrow(
        'Registration already activated',
      );
      expect(transactionRollback).toHaveBeenCalled();
    });

    it('does not wrap ConflictException as a generic transaction error', async () => {
      registrationFindOne.mockResolvedValue(null);

      await expect(service.activateRegistration(99)).rejects.not.toThrow(
        /Transaction commit failed/,
      );
    });

    it('sends owner welcome mail using the created project id', async () => {
      const createdProject = { id: 55 };
      const user = { id: 12, eventId: 1 };

      registrationFindOne.mockResolvedValue({
        id: 13,
        eventId: 1,
        project_code: null,
        project_name: 'My project',
        project_descr: 'Desc',
        project_type: 'type',
        project_lang: 'nl',
        language: 'nl',
        email: 'user@example.com',
        gsm: '123',
        firstname: 'A',
        lastname: 'B',
        sex: 'x',
        birthmonth: new Date('2010-05-01'),
        tshirtId: 1,
        via: '',
        via_type: null,
        medical: '',
        internalinfo: '',
        postalcode: 1000,
        municipality_name: 'Brussels',
        gsm_guardian: null,
        email_guardian: null,
      });
      eventFindByPk.mockResolvedValue({ id: 1, maxVoucher: 3 });
      userCreate.mockResolvedValue(user);
      projectCreate.mockResolvedValue(createdProject);
      projectFindByPk.mockResolvedValue(createdProject);

      const result = await service.activateRegistration(13);

      expect(result).toBe(user);
      expect(projectFindByPk).toHaveBeenCalledWith(55);
      expect(welcomeMailOwner).toHaveBeenCalledWith(
        user,
        createdProject,
        'login-jwt',
      );
      expect(welcomeMailCoWorker).not.toHaveBeenCalled();
    });

    it('still returns user when welcome mail fails', async () => {
      const createdProject = { id: 55 };
      const user = { id: 12, eventId: 1 };

      registrationFindOne.mockResolvedValue({
        id: 14,
        eventId: 1,
        project_code: null,
        project_name: 'My project',
        project_descr: 'Desc',
        project_type: 'type',
        project_lang: 'nl',
        language: 'nl',
        email: 'user@example.com',
        gsm: '123',
        firstname: 'A',
        lastname: 'B',
        sex: 'x',
        birthmonth: new Date('2010-05-01'),
        tshirtId: 1,
        via: '',
        via_type: null,
        medical: '',
        internalinfo: '',
        postalcode: 1000,
        municipality_name: 'Brussels',
        gsm_guardian: null,
        email_guardian: null,
      });
      eventFindByPk.mockResolvedValue({ id: 1, maxVoucher: 3 });
      userCreate.mockResolvedValue(user);
      projectCreate.mockResolvedValue(createdProject);
      projectFindByPk.mockResolvedValue(createdProject);
      welcomeMailOwner.mockRejectedValue(new Error('SMTP down'));

      const result = await service.activateRegistration(14);

      expect(result).toBe(user);
    });
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
        .mockResolvedValueOnce({ id: 7, projectId: 9, update });
      projectFindByPk.mockResolvedValue({ id: 9, deletedAt: null });

      await service.assignParticipant(42, 'valid-voucher');

      expect(update).toHaveBeenCalledWith({ userId: 42 });
    });
  });
});
