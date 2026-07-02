import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { Project } from '@coolestprojects/database';
import { Voucher } from '@coolestprojects/database';

describe('ParticipantService', () => {
  let service: ParticipantService;

  const projectModel = {
    findOne: jest.fn(),
  };
  const voucherModel = {
    count: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        { provide: getModelToken(Project), useValue: projectModel },
        { provide: getModelToken(Voucher), useValue: voucherModel },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
  });

  it('throws NotFoundException when owner has no project', async () => {
    projectModel.findOne.mockResolvedValue(null);

    await expect(service.generateParticipantVoucher(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when max vouchers reached', async () => {
    projectModel.findOne.mockResolvedValue({ id: 1, eventId: 1, maxVoucher: 2 });
    voucherModel.count.mockResolvedValue(2);

    await expect(service.generateParticipantVoucher(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates voucher when slots remain', async () => {
    projectModel.findOne.mockResolvedValue({ id: 1, eventId: 1, maxVoucher: 3 });
    voucherModel.count.mockResolvedValue(1);
    voucherModel.create.mockResolvedValue({ id: 9, voucherGuid: 'token' });

    const result = await service.generateParticipantVoucher(1);

    expect(voucherModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 1, eventId: 1 }),
    );
    expect(result.id).toBe(9);
  });

  it('destroys pending voucher on remove', async () => {
    const destroy = jest.fn();
    projectModel.findOne.mockResolvedValue({ id: 1 });
    voucherModel.findOne.mockResolvedValue({
      participantId: null,
      destroy,
      update: jest.fn(),
    });

    const removed = await service.removeParticipant(1, 10);

    expect(removed).toBe(true);
    expect(destroy).toHaveBeenCalled();
  });

  it('detaches registered participant on remove', async () => {
    const update = jest.fn();
    projectModel.findOne.mockResolvedValue({ id: 1 });
    voucherModel.findOne.mockResolvedValue({
      participantId: 5,
      destroy: jest.fn(),
      update,
    });

    const removed = await service.removeParticipant(1, 10);

    expect(removed).toBe(true);
    expect(update).toHaveBeenCalledWith({ participantId: null });
  });

  it('returns false when voucher is not found', async () => {
    projectModel.findOne.mockResolvedValue({ id: 1 });
    voucherModel.findOne.mockResolvedValue(null);

    await expect(service.removeParticipant(1, 10)).resolves.toBe(false);
  });

  it('detaches coworker voucher on leave', async () => {
    const update = jest.fn();
    projectModel.findOne.mockResolvedValue(null);
    voucherModel.findOne.mockResolvedValue({ update });

    await service.leaveProject(5);

    expect(update).toHaveBeenCalledWith({ participantId: null });
  });

  it('throws ForbiddenException when project owner tries to leave', async () => {
    projectModel.findOne.mockResolvedValue({ id: 1 });

    await expect(service.leaveProject(1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws NotFoundException when user has no project membership', async () => {
    projectModel.findOne.mockResolvedValue(null);
    voucherModel.findOne.mockResolvedValue(null);

    await expect(service.leaveProject(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
