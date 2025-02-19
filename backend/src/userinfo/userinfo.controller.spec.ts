import { Test, TestingModule } from '@nestjs/testing';
import { UserinfoController } from './userinfo.controller';

describe('UserinfoController', () => {
  let controller: UserinfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserinfoController],
    }).compile();

    controller = module.get<UserinfoController>(UserinfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
