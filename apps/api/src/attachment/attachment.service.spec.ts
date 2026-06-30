import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AzureBlobService } from '../azureblob/azureblob.service';
import {
  Project,
  Event,
  Attachment,
  AzureBlob,
} from '@coolestprojects/database';

describe('AttachmentService', () => {
  let service: AttachmentService;

  const mockAzureBlobService = {
    generateSAS: jest.fn().mockResolvedValue({
      url: 'https://example.blob/test.mp4?sas',
      expiresOn: new Date(),
      startsOn: new Date(),
    }),
    syncContainer: jest.fn().mockResolvedValue(undefined),
    deleteBlob: jest.fn().mockResolvedValue(undefined),
  };

  const mockProjectModel = {
    findOne: jest.fn(),
  };

  const mockEventModel = {
    findByPk: jest.fn(),
  };

  const mockAttachmentModel = {
    create: jest.fn(),
    destroy: jest.fn(),
  };

  const mockAzureBlobModel = {
    findOne: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn((callback) => callback()),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        { provide: AzureBlobService, useValue: mockAzureBlobService },
        { provide: getModelToken(Project), useValue: mockProjectModel },
        { provide: getModelToken(Event), useValue: mockEventModel },
        { provide: getModelToken(Attachment), useValue: mockAttachmentModel },
        { provide: getModelToken(AzureBlob), useValue: mockAzureBlobModel },
        { provide: getConnectionToken(), useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttachment', () => {
    it('throws when no project found', async () => {
      mockProjectModel.findOne.mockResolvedValue(null);

      await expect(
        service.createAttachment(
          { name: 'test', filename: 'test.mp4', size: 100 },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when file exceeds max size', async () => {
      mockProjectModel.findOne.mockResolvedValue({ id: 1, eventId: 1 });
      mockEventModel.findByPk.mockResolvedValue({
        id: 1,
        maxFileSize: 50,
        azure_storage_container: 'container',
      });

      await expect(
        service.createAttachment(
          { name: 'test', filename: 'test.mp4', size: 100 },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates attachment and returns SAS', async () => {
      mockProjectModel.findOne.mockResolvedValue({ id: 1, eventId: 1 });
      mockEventModel.findByPk.mockResolvedValue({
        id: 1,
        maxFileSize: 1000,
        azure_storage_container: 'container',
      });
      mockAttachmentModel.create.mockResolvedValue({ id: 1 });

      const result = await service.createAttachment(
        { name: 'test', filename: 'test.mp4', size: 100 },
        1,
      );

      expect(mockAzureBlobService.syncContainer).toHaveBeenCalledWith(
        'container',
      );
      expect(mockAttachmentModel.create).toHaveBeenCalled();
      expect(mockAzureBlobService.generateSAS).toHaveBeenCalledWith(
        expect.stringMatching(/\.mp4$/),
        'w',
        null,
        'container',
      );
      expect(result.url).toContain('example.blob');
    });
  });

  describe('deleteAttachment', () => {
    it('throws when attachment not found', async () => {
      mockProjectModel.findOne.mockResolvedValue({ id: 1 });
      mockAzureBlobModel.findOne.mockResolvedValue(null);

      await expect(service.deleteAttachment('missing.mp4', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes attachment and blob', async () => {
      mockProjectModel.findOne.mockResolvedValue({ id: 1 });
      mockAzureBlobModel.findOne.mockResolvedValue({
        attachmentId: 5,
        container_name: 'container',
      });

      await service.deleteAttachment('file.mp4', 1);

      expect(mockAttachmentModel.destroy).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(mockAzureBlobService.deleteBlob).toHaveBeenCalledWith(
        'file.mp4',
        'container',
      );
    });
  });
});
