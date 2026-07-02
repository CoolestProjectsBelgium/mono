import { Test, TestingModule } from '@nestjs/testing';
import { VideoPosterService } from './video-poster.service';
import { AzureBlobService } from '../azureblob/azureblob.service';

jest.mock('node:child_process', () => ({
  execFile: jest.fn(),
}));

describe('VideoPosterService', () => {
  let service: VideoPosterService;

  const mockAzureBlobService = {
    checkBlobExists: jest.fn(),
    downloadBlobToFile: jest.fn(),
    uploadFileToBlob: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoPosterService,
        { provide: AzureBlobService, useValue: mockAzureBlobService },
      ],
    }).compile();

    service = module.get(VideoPosterService);
  });

  it('returns existing poster blob name when already present', async () => {
    mockAzureBlobService.checkBlobExists.mockResolvedValue(true);

    await expect(service.ensurePoster('clip.mp4', 'container')).resolves.toBe(
      'clip.mp4.poster.jpg',
    );
    expect(mockAzureBlobService.downloadBlobToFile).not.toHaveBeenCalled();
  });
});
