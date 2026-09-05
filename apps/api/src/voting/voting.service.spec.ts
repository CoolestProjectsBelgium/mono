import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Account, Award, Event, EventTable, Project, Vote, VoteCategory } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { VotingService } from './voting.service';

describe('VotingService', () => {
  let service: VotingService;
  let eventFindOne: jest.Mock;
  let eventFindByPk: jest.Mock;
  let query: jest.Mock;
  let voteDestroy: jest.Mock;
  let awardDestroy: jest.Mock;

  beforeEach(async () => {
    eventFindOne = jest.fn();
    eventFindByPk = jest.fn();
    query = jest.fn().mockResolvedValue([]);
    voteDestroy = jest.fn().mockResolvedValue(2);
    awardDestroy = jest.fn().mockResolvedValue(1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotingService,
        {
          provide: Sequelize,
          useValue: { query },
        },
        { provide: getModelToken(Event), useValue: { findOne: eventFindOne, findByPk: eventFindByPk } },
        { provide: getModelToken(Vote), useValue: { destroy: voteDestroy } },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(VoteCategory), useValue: {} },
        { provide: getModelToken(EventTable), useValue: {} },
        { provide: getModelToken(Award), useValue: { destroy: awardDestroy } },
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

  describe('voting controls', () => {
    it('rejects non-positive voting durations', async () => {
      eventFindByPk.mockResolvedValue({ votingOpen: false });

      await expect(service.openVotingWithDuration(1, 0))
        .rejects.toThrow('Voting duration must be greater than zero');
    });

    it('clears previous votes and awards only when requested', async () => {
      const event: any = { votingOpen: false, save: jest.fn() };
      eventFindByPk.mockResolvedValue(event);

      await service.openVotingWithDuration(1, 30, false);
      expect(voteDestroy).not.toHaveBeenCalled();
      expect(awardDestroy).not.toHaveBeenCalled();

      await service.openVotingWithDuration(1, 30, true);
      expect(voteDestroy).toHaveBeenCalledWith({ where: { eventId: 1 } });
      expect(awardDestroy).toHaveBeenCalledWith({ where: { eventId: 1 } });
    });

    it('publishes a timer event when voting starts', async () => {
      const event: any = {
        votingOpen: false,
        save: jest.fn(),
      };
      eventFindByPk.mockResolvedValue(event);

      const events: unknown[] = [];
      service.stream().subscribe((value) => events.push(value));
      await service.openVotingWithDuration(1, 30);

      expect(event.save).toHaveBeenCalled();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ type: 'timer' });
      expect(event.votingEndDate.getTime()).toBeGreaterThan(event.votingStartDate.getTime());
    });

    it('allows stopping an already closed voting window', async () => {
      const event: any = {
        votingOpen: false,
        votingStartDate: new Date('2026-09-01T10:00:00.000Z'),
        votingEndDate: new Date('2026-09-01T11:00:00.000Z'),
        save: jest.fn(),
      };
      eventFindByPk.mockResolvedValue(event);

      await expect(service.closeVotingNow(1)).resolves.toBeUndefined();
      expect(event.save).not.toHaveBeenCalled();
    });

    it('scopes calculated votes to the requested event', async () => {
      eventFindByPk.mockResolvedValue({ votingOpen: false });

      await service.calculateVotes(42);

      expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE v.eventId = :eventId'), {
        type: expect.anything(),
        replacements: { eventId: 42 },
      });
    });
  });
});
