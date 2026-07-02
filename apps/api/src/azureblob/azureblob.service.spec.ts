import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AzureBlobService } from './azureblob.service';
import { rewriteBlobUrlForClient } from './rewrite-blob-url';

jest.mock('./rewrite-blob-url', () => ({
  rewriteBlobUrlForClient: jest.fn((url: string) => url),
}));

describe('AzureBlobService', () => {
  let service: AzureBlobService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureBlobService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AZURE_BLOB_PUBLIC_BASE_URL') {
                return 'https://registration.coolestprojects.localhost:8443/_blob';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AzureBlobService>(AzureBlobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('passes AZURE_BLOB_PUBLIC_BASE_URL to rewriteBlobUrlForClient in generateSAS', async () => {
    const sasUrl =
      'http://azurite:10000/devstoreaccount1/container/blob.mp4?sv=2021';
    const blockBlobClient = {
      generateSasUrl: jest.fn().mockResolvedValue(sasUrl),
    };
    jest
      .spyOn(service as any, 'getBlobClient')
      .mockResolvedValue(blockBlobClient);
    (rewriteBlobUrlForClient as jest.Mock).mockReturnValue(
      'https://registration.coolestprojects.localhost:8443/_blob/devstoreaccount1/container/blob.mp4?sv=2021',
    );

    const result = await service.generateSAS('blob.mp4', 'w', null, 'container');

    expect(rewriteBlobUrlForClient).toHaveBeenCalledWith(
      sasUrl,
      'https://registration.coolestprojects.localhost:8443/_blob',
    );
    expect(result.url).toBe(
      'https://registration.coolestprojects.localhost:8443/_blob/devstoreaccount1/container/blob.mp4?sv=2021',
    );
  });
});
