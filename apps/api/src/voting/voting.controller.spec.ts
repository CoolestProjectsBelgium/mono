import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  VotingController,
  parseLanguagesQuery,
  parseSkipProjectQuery,
} from './voting.controller';
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

  it('passes sanitised query values and the jury account to the service', async () => {
    const getProjects = vi.fn().mockResolvedValue({ message: 'done' });
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
      controllers: [VotingController],
      providers: [
        { provide: VotingService, useValue: { getProjects } },
        { provide: VOTING_JWT, useValue: {} },
      ],
    }).compile();

    await module
      .get(VotingController)
      .getProjects(
        { user: { id: 9, eventId: 4 } },
        { languages: '["fr","xx"]', skipProject: '{"$ne":1}' },
      );

    expect(getProjects).toHaveBeenCalledWith(4, null, ['fr'], 9);
  });
});

describe('parseLanguagesQuery', () => {
  it('keeps only known language codes', () => {
    expect(parseLanguagesQuery('["nl","de","en"]')).toEqual(['nl', 'en']);
  });

  it.each([undefined, '', 'nl', '[]', '["de"]', '{"a":1}', '[1,2]'])(
    'falls back to all languages for %j',
    (raw) => {
      expect(parseLanguagesQuery(raw)).toEqual(['nl', 'fr', 'en']);
    },
  );
});

describe('parseSkipProjectQuery', () => {
  it('returns an integer project id', () => {
    expect(parseSkipProjectQuery('12')).toBe(12);
  });

  it.each([undefined, '', 'abc', '1.5', '"12"', '[1]', '{"$ne":1}', 'null'])(
    'returns null for %j',
    (raw) => {
      expect(parseSkipProjectQuery(raw)).toBeNull();
    },
  );
});
