import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { VotingController } from './voting.controller';

describe('VotingController', () => {
  let controller: VotingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
      controllers: [VotingController],
    }).compile();

    controller = module.get<VotingController>(VotingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
