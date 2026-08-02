import { Test, TestingModule } from '@nestjs/testing';
import { PresentationService } from './presentation.service';

describe('PresentationService', () => {
  let service: PresentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresentationService],
    }).compile();

    service = module.get<PresentationService>(PresentationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
