import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import {
  Affiliation,
  Event,
  Project,
  Question,
  Registration,
  TshirtGroup,
  User,
} from '@coolestprojects/database';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let affiliationFindAll: jest.Mock;

  beforeEach(async () => {
    affiliationFindAll = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getModelToken(TshirtGroup), useValue: {} },
        { provide: getModelToken(Question), useValue: {} },
        { provide: getModelToken(Event), useValue: {} },
        { provide: getModelToken(Registration), useValue: {} },
        { provide: getModelToken(User), useValue: {} },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(Affiliation), useValue: { findAll: affiliationFindAll } },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('returns event-scoped dojos ordered by name', async () => {
    affiliationFindAll.mockResolvedValue([
      { id: 2, name: 'Westerlo' },
      { id: 1, name: 'Balen' },
    ]);

    await expect(
      service.findAllDojos({
        currentEvent: 9,
        language: 'nl',
        closed: false,
        current: true,
        projectClosed: false,
        registrationOpen: true,
      }),
    ).resolves.toEqual([
      { id: 2, name: 'Westerlo' },
      { id: 1, name: 'Balen' },
    ]);

    expect(affiliationFindAll).toHaveBeenCalledWith({
      attributes: ['id', 'name'],
      where: { eventId: 9 },
      order: [['name', 'ASC']],
    });
  });
});
