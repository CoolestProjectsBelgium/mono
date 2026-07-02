import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Project, User, Voucher, Attachment } from '@coolestprojects/database';
import { ProjectinfoService } from './projectinfo.service';
import { AzureBlobService } from '../azureblob/azureblob.service';

describe('ProjectinfoService', () => {
  let service: ProjectinfoService;
  let projectModel: { findOne: jest.Mock; findByPk: jest.Mock };
  let voucherModel: { findOne: jest.Mock; findAll: jest.Mock; count: jest.Mock };
  let userModel: { findByPk: jest.Mock };
  let attachmentModel: { findAll: jest.Mock };
  let azureBlobService: {
    deleteBlob: jest.Mock
    checkBlobExists: jest.Mock
    generateSAS: jest.Mock
  }

  beforeEach(async () => {
    projectModel = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };
    voucherModel = {
      findOne: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
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
        { provide: getModelToken(Attachment), useValue: attachmentModel = { findAll: jest.fn().mockResolvedValue([]) } },
        {
          provide: AzureBlobService,
          useValue: azureBlobService = {
            deleteBlob: jest.fn(),
            checkBlobExists: jest.fn().mockResolvedValue(true),
            generateSAS: jest.fn().mockResolvedValue({ url: 'https://example.blob/file?sas=1' }),
          },
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
    projectModel.findOne.mockResolvedValueOnce({
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

    expect(projectModel.findOne).toHaveBeenCalledWith({
      where: { id: 7, removedAt: null },
    });
    expect(result.is_owner).toBe(false);
    expect(result.own_project).toMatchObject({
      project_id: '7',
      project_name: 'Team project',
      participants: [
        expect.objectContaining({ name: 'Alex', is_owner: true, self: false }),
      ],
    });
  });

  it('returns attachments with name and filename for owners', async () => {
    projectModel.findOne.mockResolvedValue({
      get: () => ({
        id: 1,
        ownerId: 9,
        name: 'My project',
        description: 'desc',
        type: 'game',
        language: 'nl',
      }),
    });
    attachmentModel.findAll.mockResolvedValue([
      {
        get: () => ({
          name: 'My clip',
          filename: 'clip.mp4',
          confirmed: false,
          azureBlob: {
            blob_name: 'uuid.mp4',
            container_name: 'container',
            size: 512,
          },
        }),
      },
    ]);

    const result = await service.getProjectInfo(9);

    expect(result.attachments).toEqual([
      expect.objectContaining({
        id: 'uuid.mp4',
        name: 'My clip',
        filename: 'clip.mp4',
        exists: true,
        type: 'movie',
      }),
    ]);
  });

  it('soft-deletes a project by setting removedAt', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const project = {
      id: 3,
      removedAt: null as Date | null,
      save,
    };
    projectModel.findOne.mockResolvedValue(project);
    voucherModel.count.mockResolvedValue(0);

    await service.deleteProject(9);

    expect(project.removedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
    expect(azureBlobService.deleteBlob).not.toHaveBeenCalled();
  });
});
