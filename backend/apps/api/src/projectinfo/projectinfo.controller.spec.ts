import { Test, TestingModule } from '@nestjs/testing';
import { ProjectinfoController } from './projectinfo.controller';

describe('ProjectinfoController', () => {
  let controller: ProjectinfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectinfoController],
    }).compile();

    controller = module.get<ProjectinfoController>(ProjectinfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
