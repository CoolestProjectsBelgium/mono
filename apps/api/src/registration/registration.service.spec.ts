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
  let projectCount: jest.Mock;
  let eventFindByPk: jest.Mock;
  let eventFindAll: jest.Mock;
  let userCreate: jest.Mock;
  let userFindByPk: jest.Mock;
  let registrationFindAll: jest.Mock;
  let registrationCount: jest.Mock;
  let welcomeMailOwner: jest.Mock;
  let welcomeMailCoWorker: jest.Mock;
  let notifyProjectOwner: jest.Mock;
  let notifyProjectOwnerParticipantLeft: jest.Mock;
  let registrationMail: jest.Mock;
  let generateLoginToken: jest.Mock;
  let generateRegistrationToken: jest.Mock;

  beforeEach(async () => {
    userProjectFindOne = jest.fn();
    registrationFindOne = jest.fn();
    transactionCommit = jest.fn().mockResolvedValue(undefined);
    transactionRollback = jest.fn().mockResolvedValue(undefined);
    projectFindByPk = jest.fn();
    projectCreate = jest.fn();
    projectCount = jest.fn().mockResolvedValue(0);
    eventFindByPk = jest.fn();
    eventFindAll = jest.fn().mockResolvedValue([]);
    userCreate = jest.fn();
    userFindByPk = jest.fn();
    registrationFindAll = jest.fn().mockResolvedValue([]);
    registrationCount = jest.fn().mockResolvedValue(0);
    welcomeMailOwner = jest.fn().mockResolvedValue(undefined);
    welcomeMailCoWorker = jest.fn().mockResolvedValue(undefined);
    notifyProjectOwner = jest.fn().mockResolvedValue(undefined);
    notifyProjectOwnerParticipantLeft = jest.fn().mockResolvedValue(undefined);
    registrationMail = jest.fn().mockResolvedValue(undefined);
    generateLoginToken = jest.fn().mockReturnValue('login-jwt');
    generateRegistrationToken = jest.fn().mockReturnValue('registration-jwt');

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
            notifyProjectOwner,
            notifyProjectOwnerParticipantLeft,
            registrationMail,
          },
        },
        {
          provide: TokensService,
          useValue: { generateLoginToken, generateRegistrationToken },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            transaction: jest.fn().mockResolvedValue(transaction),
          },
        },
        {
          provide: getModelToken(Event),
          useValue: { findByPk: eventFindByPk, findAll: eventFindAll },
        },
        {
          provide: getModelToken(Project),
          useValue: {
            findByPk: projectFindByPk,
            create: projectCreate,
            count: projectCount,
          },
        },
        {
          provide: getModelToken(Registration),
          useValue: {
            findOne: registrationFindOne,
            findAll: registrationFindAll,
            count: registrationCount,
            destroy: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getModelToken(User),
          useValue: { create: userCreate, findByPk: userFindByPk },
        },
        { provide: getModelToken(Question), useValue: {} },
        {
          provide: getModelToken(QuestionUser),
          useValue: { bulkCreate: jest.fn() },
        },
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

    it('notifies the project owner when a co-worker joins via voucher', async () => {
      const owner = { id: 99, email: 'owner@test.be' };
      const project = {
        id: 55,
        deletedAt: null,
        getOwner: jest.fn().mockResolvedValue(owner),
      };
      const coworker = { id: 12, eventId: 1 };
      const voucherUpdate = jest.fn().mockResolvedValue(undefined);

      registrationFindOne.mockResolvedValue({
        id: 20,
        eventId: 1,
        project_code: 'voucher-guid',
        language: 'nl',
        email: 'coworker@example.com',
        gsm: '123',
        firstname: 'Co',
        lastname: 'Worker',
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
      userCreate.mockResolvedValue(coworker);
      userProjectFindOne.mockResolvedValue({
        projectId: 55,
        update: voucherUpdate,
      });
      projectFindByPk.mockResolvedValue(project);

      const result = await service.activateRegistration(20);

      expect(result).toBe(coworker);
      expect(voucherUpdate.mock.calls[0][0]).toEqual({ userId: 12 });
      expect(welcomeMailCoWorker).toHaveBeenCalledWith(
        coworker,
        project,
        'login-jwt',
      );
      expect(project.getOwner).toHaveBeenCalled();
      expect(notifyProjectOwner).toHaveBeenCalledWith(
        owner,
        coworker,
        project,
        'login-jwt',
      );
    });

    it('does not notify an owner when the project has none', async () => {
      const project = {
        id: 55,
        deletedAt: null,
        getOwner: jest.fn().mockResolvedValue(undefined),
      };
      const coworker = { id: 12, eventId: 1 };

      registrationFindOne.mockResolvedValue({
        id: 21,
        eventId: 1,
        project_code: 'voucher-guid',
        language: 'nl',
        email: 'coworker2@example.com',
        gsm: '123',
        firstname: 'Co',
        lastname: 'Worker',
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
      userCreate.mockResolvedValue(coworker);
      userProjectFindOne.mockResolvedValue({
        projectId: 55,
        update: jest.fn().mockResolvedValue(undefined),
      });
      projectFindByPk.mockResolvedValue(project);

      await service.activateRegistration(21);

      expect(notifyProjectOwner).not.toHaveBeenCalled();
    });
  });

  describe('unassignParticipant', () => {
    it('notifies the project owner when a participant leaves', async () => {
      const owner = { id: 99 };
      const project = { id: 55, getOwner: jest.fn().mockResolvedValue(owner) };
      const leavingUser = { id: 12, firstname: 'Co', lastname: 'Worker' };
      const participationUpdate = jest.fn().mockResolvedValue(undefined);

      userProjectFindOne.mockResolvedValue({
        projectId: 55,
        update: participationUpdate,
      });
      userFindByPk.mockResolvedValue(leavingUser);
      projectFindByPk.mockResolvedValue(project);

      await service.unassignParticipant(12, 'voucher-guid');

      expect(participationUpdate).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(project.getOwner).toHaveBeenCalled();
      expect(notifyProjectOwnerParticipantLeft).toHaveBeenCalledWith(
        owner,
        leavingUser,
        project,
        'login-jwt',
      );
    });

    it('still unassigns the participant when notifying the owner fails', async () => {
      const owner = { id: 99 };
      const project = { id: 55, getOwner: jest.fn().mockResolvedValue(owner) };
      const leavingUser = { id: 12, firstname: 'Co', lastname: 'Worker' };
      const participationUpdate = jest.fn().mockResolvedValue(undefined);

      userProjectFindOne.mockResolvedValue({
        projectId: 55,
        update: participationUpdate,
      });
      userFindByPk.mockResolvedValue(leavingUser);
      projectFindByPk.mockResolvedValue(project);
      notifyProjectOwnerParticipantLeft.mockRejectedValueOnce(
        new Error('SMTP down'),
      );

      await expect(
        service.unassignParticipant(12, 'voucher-guid'),
      ).resolves.toBeUndefined();

      expect(participationUpdate).toHaveBeenCalled();
    });

    it('throws when the participation record is missing', async () => {
      userProjectFindOne.mockResolvedValue(null);

      await expect(service.unassignParticipant(12, 'bad-code')).rejects.toThrow(
        'Project not found or not assigned to user',
      );
    });
  });

  describe('promoteWaitingList', () => {
    it('promotes the oldest waitlisted registrations up to the number of free slots', async () => {
      eventFindByPk.mockResolvedValue({ id: 1, maxRegistration: 5 });
      projectCount.mockResolvedValue(3);
      registrationCount.mockResolvedValue(1); // confirmed (non-waitlisted) pending
      const update = jest.fn().mockResolvedValue(undefined);
      const candidate = { id: 30, update };
      registrationFindAll.mockResolvedValue([candidate]);

      await service.promoteWaitingList(1);

      expect(registrationCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: 1, project_code: null, waiting_list: false },
        }),
      );
      expect(registrationFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: 1, project_code: null, waiting_list: true },
          order: [['createdAt', 'ASC']],
          limit: 1, // 5 - (3 + 1)
        }),
      );
      expect(update).toHaveBeenCalledWith(
        { waiting_list: false },
        expect.anything(),
      );
      expect(generateRegistrationToken).toHaveBeenCalledWith(30);
      expect(registrationMail).toHaveBeenCalledWith(
        candidate,
        'registration-jwt',
      );
    });

    it('does nothing when no slots are free', async () => {
      eventFindByPk.mockResolvedValue({ id: 1, maxRegistration: 5 });
      projectCount.mockResolvedValue(5);
      registrationCount.mockResolvedValue(0);

      await service.promoteWaitingList(1);

      expect(registrationFindAll).not.toHaveBeenCalled();
      expect(registrationMail).not.toHaveBeenCalled();
    });

    it('keeps the promotion even when sending the activation mail fails', async () => {
      eventFindByPk.mockResolvedValue({ id: 1, maxRegistration: 5 });
      projectCount.mockResolvedValue(3);
      registrationCount.mockResolvedValue(1);
      const update = jest.fn().mockResolvedValue(undefined);
      registrationFindAll.mockResolvedValue([{ id: 31, update }]);
      registrationMail.mockRejectedValueOnce(new Error('SMTP down'));

      await expect(service.promoteWaitingList(1)).resolves.toBeUndefined();

      expect(update).toHaveBeenCalledWith(
        { waiting_list: false },
        expect.anything(),
      );
      expect(transactionCommit).toHaveBeenCalled();
    });

    it('does nothing when the event cannot be found', async () => {
      eventFindByPk.mockResolvedValue(null);

      await service.promoteWaitingList(999);

      expect(registrationCount).not.toHaveBeenCalled();
      expect(registrationMail).not.toHaveBeenCalled();
    });
  });

  describe('assignParticipant', () => {
    it('rejects when user already has a project', async () => {
      userProjectFindOne.mockResolvedValueOnce({ id: 1, userId: 42 });

      await expect(
        service.assignParticipant(42, 'voucher-guid'),
      ).rejects.toThrow('User already has a project');
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
