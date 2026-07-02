import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Project, User, Voucher, Attachment } from '@coolestprojects/database';
import { ProjectinfoService } from './projectinfo.service';
import { AzureBlobService } from '../azureblob/azureblob.service';

describe('ProjectinfoService', () => {
  let service: ProjectinfoService;
  let projectModel: { findOne: jest.Mock; findByPk: jest.Mock };
  let voucherModel: { findOne: jest.Mock; findAll: jest.Mock };
  let userModel: { findByPk: jest.Mock };

  beforeEach(async () => {
    projectModel = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };
    voucherModel = {
      findOne: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
    };
    userModel = {
      findByPk: jest.fn().mockResolvedValue({
        getDataValue: (key: string) => (key === 'id' ? 1 : 'Alex'),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectinfoService,
        { provide: getModelToken(Project), useValue: projectModel },
        { provide: getModelToken(Voucher), useValue: voucherModel },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(Attachment), useValue: { findAll: jest.fn().mockResolvedValue([]) } },
        {
          provide: AzureBlobService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(ProjectinfoService);
  });

  it('loads project for voucher participants via projectId', async () => {
    projectModel.findOne.mockResolvedValueOnce(null);
    voucherModel.findOne.mockResolvedValue({
      getDataValue: (key: string) => (key === 'projectId' ? 7 : undefined),
    });
    projectModel.findByPk.mockResolvedValue({
      get: () => ({
        id: 7,
        ownerId: 1,
        name: 'Team project',
        description: 'Built together',
        type: 'game',
        language: 'nl',
      }),
    });

    const result = await service.getProjectInfo(42);

    expect(projectModel.findByPk).toHaveBeenCalledWith(7);
    expect(result.is_owner).toBe(false);
    expect(result.own_project).toMatchObject({
      project_id: '7',
      project_name: 'Team project',
      participants: [
        expect.objectContaining({ name: 'Alex', is_owner: true, self: false }),
      ],
    });
  });
});
