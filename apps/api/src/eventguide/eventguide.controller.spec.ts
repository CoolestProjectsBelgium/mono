import { Test, TestingModule } from '@nestjs/testing';
import { EventguideController } from './eventguide.controller';

describe('EventguideController', () => {
  let controller: EventguideController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventguideController],
    }).compile();

    controller = module.get<EventguideController>(EventguideController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
