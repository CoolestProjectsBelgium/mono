import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundService } from './background.service';

describe('BackgroundService', () => {
  let service: BackgroundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackgroundService],
    }).compile();

    service = module.get<BackgroundService>(BackgroundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
