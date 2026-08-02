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
      .mockResolvedValueOnce({
        projectId: 10,
        getProject: jest.fn().mockResolvedValue({ id: 10, deletedAt: null }),
      })
      .mockResolvedValueOnce(voucher);

    await service.deleteUnusedVoucher(5, 'voucher-guid');

    expect(voucher.deletedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
  });

  it('soft-deletes assigned participant voucher when owner removes registered co-participant', async () => {
    const save = jest.fn();
    const voucher = { userId: 42, deletedAt: null as Date | null, save };
    userProjectModel.findOne
      .mockResolvedValueOnce({ projectId: 10, getProject: jest.fn().mockResolvedValue({ id: 10, deletedAt: null }) })
      .mockResolvedValueOnce(voucher);

    await service.deleteUnusedVoucher(5, 'voucher-guid');

    expect(voucher.deletedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
  });
});

describe('ProjectinfoService deleteProject', () => {
  let service: ProjectinfoService;
  const userProjectModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const projectModel = {
    create: jest.fn(),
    update: jest.fn(),
  };
  const userModel = {
    findByPk: jest.fn(),
  };
  const eventModel = {
    findByPk: jest.fn(),
  };
  const attachmentModel = {};
  const transaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  const sequelize = {
    transaction: jest.fn().mockResolvedValue(transaction),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sequelize.transaction.mockResolvedValue(transaction);
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

  it('soft-deletes project and all memberships when owner is alone', async () => {
    const project = {
      id: 10,
      deletedAt: null as Date | null,
      save: jest.fn(),
    };
    userProjectModel.findOne.mockResolvedValue({
      projectId: 10,
      getProject: jest.fn().mockResolvedValue(project),
    });
    userProjectModel.count.mockResolvedValue(0);
    userProjectModel.update.mockResolvedValue([2]);
    projectModel.update.mockResolvedValue([1]);

    await service.deleteProject(5);

    expect(userProjectModel.update).toHaveBeenCalledWith(
      { deletedAt: expect.any(Date) },
      expect.objectContaining({
        where: { projectId: 10, deletedAt: null },
        transaction,
      }),
    );
    expect(projectModel.update).toHaveBeenCalledWith(
      { deletedAt: expect.any(Date) },
      expect.objectContaining({
        where: { id: 10, deletedAt: null },
        transaction,
      }),
    );
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('rejects delete when registered co-participants exist', async () => {
    userProjectModel.findOne.mockResolvedValue({
      projectId: 10,
      getProject: jest.fn().mockResolvedValue({ id: 10, deletedAt: null }),
    });
    userProjectModel.count.mockResolvedValue(1);

    await expect(service.deleteProject(5)).rejects.toThrow(
      'Cannot delete project with associated vouchers',
    );
    expect(userProjectModel.update).not.toHaveBeenCalled();
  });
});
