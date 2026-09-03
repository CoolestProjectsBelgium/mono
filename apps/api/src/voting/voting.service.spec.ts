import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Account, Award, Event, EventTable, Project, Vote, VoteCategory } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { VotingService } from './voting.service';

describe('VotingService', () => {
  let service: VotingService;
  let eventFindOne: jest.Mock;

  beforeEach(async () => {
    eventFindOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotingService,
        {
          provide: Sequelize,
          useValue: { query: jest.fn() },
        },
        { provide: getModelToken(Event), useValue: { findOne: eventFindOne, findByPk: jest.fn() } },
        { provide: getModelToken(Vote), useValue: {} },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(VoteCategory), useValue: {} },
        { provide: getModelToken(EventTable), useValue: {} },
        { provide: getModelToken(Award), useValue: {} },
      ],
    }).compile();

    service = module.get<VotingService>(VotingService);
  });

  describe('getAccount', () => {
    it('includes voting window dates from the active event', async () => {
      const votingStartDate = new Date('2026-09-01T10:00:00.000Z');
      const votingEndDate = new Date('2026-09-03T18:00:00.000Z');

      jest.spyOn(Account, 'findByPk').mockResolvedValue({
        id: 3,
        email: 'jury',
      } as Account);

      eventFindOne.mockResolvedValue({
        id: 1,
        votingStartDate,
        votingEndDate,
      });

      const result = await service.getAccount(3);

      expect(result).toEqual({
        id: 3,
        email: 'jury',
        eventId: 1,
        votingStartDate: votingStartDate.toISOString(),
        votingEndDate: votingEndDate.toISOString(),
      });
    });
  });
});
