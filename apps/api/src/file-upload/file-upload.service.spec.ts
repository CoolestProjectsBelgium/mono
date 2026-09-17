import * as fs from 'fs';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  const userProjectModel = {
    findOne: vi.fn(),
  };
  const attachmentModel = {
    findByPk: vi.fn(),
    create: vi.fn(),
  };

  let service: FileUploadService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FileUploadService(
      userProjectModel as never,
      attachmentModel as never,
    );
  });

  it('deleteFile rejects when the user is not the project owner', async () => {
    attachmentModel.findByPk.mockResolvedValue({
      id: 1,
      projectId: 9,
      filepath: '/tmp/uploads/project_9/file.jpg',
      thumbnailPath: '/tmp/uploads/project_9/thumbnail_file.jpg',
      destroy: vi.fn(),
    });
    userProjectModel.findOne.mockResolvedValue(null);

    await expect(service.deleteFile(1, 1)).rejects.toThrow('Unauthorized');
  });

  it('deleteFile removes attachments whose confirmed flag is unset', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    attachmentModel.findByPk.mockResolvedValue({
      id: 1,
      projectId: 9,
      confirmed: null,
      internal: null,
      filepath: '/tmp/uploads/project_9/file.jpg',
      thumbnailPath: '/tmp/uploads/project_9/thumbnail_file.jpg',
      destroy,
    });
    userProjectModel.findOne.mockResolvedValue({
      userId: 1,
      projectId: 9,
      isOwner: true,
    });

    const unlinkSpy = vi
      .spyOn(fs.promises, 'unlink')
      .mockResolvedValue(undefined);

    await service.deleteFile(1, 1);

    expect(destroy).toHaveBeenCalled();
    unlinkSpy.mockRestore();
  });

  it('deleteFile rejects confirmed attachments', async () => {
    attachmentModel.findByPk.mockResolvedValue({
      id: 2,
      projectId: 9,
      confirmed: true,
      internal: null,
      destroy: vi.fn(),
    });

    await expect(service.deleteFile(1, 2)).rejects.toThrow(
      'Attachment not found',
    );
    expect(userProjectModel.findOne).not.toHaveBeenCalled();
  });

  it('deleteFile removes the attachment for the project owner', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    attachmentModel.findByPk.mockResolvedValue({
      id: 1,
      projectId: 9,
      filepath: '/tmp/uploads/project_9/file.jpg',
      thumbnailPath: '/tmp/uploads/project_9/thumbnail_file.jpg',
      destroy,
    });
    userProjectModel.findOne.mockResolvedValue({
      userId: 1,
      projectId: 9,
      isOwner: true,
    });

    const unlinkSpy = vi
      .spyOn(fs.promises, 'unlink')
      .mockResolvedValue(undefined);

    await service.deleteFile(1, 1);

    expect(userProjectModel.findOne).toHaveBeenCalledWith({
      where: {
        userId: 1,
        deletedAt: null,
        isOwner: true,
        projectId: 9,
      },
    });
    expect(unlinkSpy).toHaveBeenCalledTimes(2);
    expect(destroy).toHaveBeenCalled();
  });
});
