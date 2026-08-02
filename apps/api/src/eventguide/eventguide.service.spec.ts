import { Test, TestingModule } from '@nestjs/testing';
import { EventguideService } from './eventguide.service';

describe('EventguideService', () => {
  let service: EventguideService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventguideService],
    }).compile();

    service = module.get<EventguideService>(EventguideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
