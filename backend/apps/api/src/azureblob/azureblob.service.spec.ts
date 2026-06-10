import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AzureBlobService } from './azureblob.service';

describe('AzureBlobService', () => {
  let service: AzureBlobService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AZURE_STORAGE_CONNECTION_STRING') {
        return 'UseDevelopmentStorage=true';
      }
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureBlobService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AzureBlobService>(AzureBlobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
