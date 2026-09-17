import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { VOTING_JWT } from '../auth/auth.module';

describe('VotingController', () => {
  let controller: VotingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
      controllers: [VotingController],
      providers: [
        { provide: VotingService, useValue: {} },
        { provide: VOTING_JWT, useValue: {} },
      ],
    }).compile();

    controller = module.get<VotingController>(VotingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
