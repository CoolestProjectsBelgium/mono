import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import { ProjectinfoService } from './projectinfo.service';
import { Project, UserProject, Attachment, User, Event } from '@coolestprojects/database';

describe('ProjectinfoService vouchers', () => {
  let service: ProjectinfoService;
  const userProjectModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  };
  const projectModel = {
    create: jest.fn(),
  };
  const userModel = {
    findByPk: jest.fn(),
  };
  const eventModel = {
    findByPk: jest.fn(),
  };
  const attachmentModel = {};
  const sequelize = {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectinfoService,
        { provide: getModelToken(Project), useValue: projectModel },
        { provide: getModelToken(UserProject), useValue: userProjectModel },
        { provide: getModelToken(Attachment), useValue: attachmentModel },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(Event), useValue: eventModel },
        { provide: getConnectionToken(), useValue: sequelize },
      ],
    }).compile();

    service = module.get(ProjectinfoService);
  });

  it('returns project_code when generating a voucher', async () => {
    userProjectModel.findOne.mockResolvedValue({
      projectId: 10,
      getProject: jest.fn().mockResolvedValue({ id: 10, eventId: 1, maxVoucher: 3 }),
    });
    userProjectModel.count.mockResolvedValue(1);
    userProjectModel.create.mockResolvedValue({});

    const result = await service.generateVoucher(5);

    expect(result.project_code).toEqual(expect.any(String));
    expect(userProjectModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 10,
        isOwner: false,
        voucherGuid: result.project_code,
      }),
    );
  });

  it('throws when voucher limit is reached', async () => {
    userProjectModel.findOne.mockResolvedValue({
      projectId: 10,
      getProject: jest.fn().mockResolvedValue({ id: 10, eventId: 1, maxVoucher: 2 }),
    });
    userProjectModel.count.mockResolvedValue(2);

    await expect(service.generateVoucher(5)).rejects.toThrow(
      'Maximum number of vouchers reached',
    );
  });

  it('soft-deletes unused voucher when removing pending invite', async () => {
    const save = jest.fn();
    const voucher = { userId: null, deletedAt: null as Date | null, save };
    userProjectModel.findOne
      .mockResolvedValueOnce({ projectId: 10 })
      .mockResolvedValueOnce(voucher);

    await service.deleteUnusedVoucher(5, 'voucher-guid');

    expect(voucher.deletedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
  });

  it('soft-deletes assigned participant voucher when owner removes registered co-participant', async () => {
    const save = jest.fn();
    const voucher = { userId: 42, deletedAt: null as Date | null, save };
    userProjectModel.findOne
      .mockResolvedValueOnce({ projectId: 10 })
      .mockResolvedValueOnce(voucher);

    await service.deleteUnusedVoucher(5, 'voucher-guid');

    expect(voucher.deletedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
  });
});
