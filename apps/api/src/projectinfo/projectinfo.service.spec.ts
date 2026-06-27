import { Test, TestingModule } from '@nestjs/testing';
import { ProjectinfoService } from './projectinfo.service';

describe('ProjectinfoService', () => {
  let service: ProjectinfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectinfoService],
    }).compile();

    service = module.get<ProjectinfoService>(ProjectinfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
