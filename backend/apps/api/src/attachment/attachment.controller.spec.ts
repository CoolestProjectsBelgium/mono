import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';

describe('AttachmentController', () => {
  let controller: AttachmentController;

  const mockAttachmentService = {
    createAttachment: jest.fn(),
    getAttachmentSAS: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        { provide: AttachmentService, useValue: mockAttachmentService },
      ],
    }).compile();

    controller = module.get<AttachmentController>(AttachmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
