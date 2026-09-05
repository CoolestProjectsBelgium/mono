import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventguideController } from './eventguide.controller';
import { EventguideService } from './eventguide.service';

describe('EventguideController', () => {
  let controller: EventguideController;

  const eventguideService = {
    getProjects: jest.fn(),
    getThumbnailByAttachmentId: jest.fn(),
    getFloorplanFilePath: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventguideController],
      providers: [
        { provide: EventguideService, useValue: eventguideService },
      ],
    }).compile();

    controller = module.get<EventguideController>(EventguideController);
  });

  it('returns projects for the current event', async () => {
    const payload = {
      event: { id: 1, title: 'Test', officialStartDate: '2026-05-01', floorplanPath: 'map.svg' },
      projects: [],
    };
    eventguideService.getProjects.mockResolvedValue(payload);

    await expect(
      controller.getCurrentEventProjects({ info: { currentEvent: 1 } }),
    ).resolves.toEqual(payload);
    expect(eventguideService.getProjects).toHaveBeenCalledWith(1);
  });

  it('rejects current-event route when no active event is available', () => {
    expect(() =>
      controller.getCurrentEventProjects({ info: { currentEvent: -1 } }),
    ).toThrow(NotFoundException);
  });

  it('returns projects for an explicit event id', async () => {
    const payload = {
      event: { id: 3, title: 'Past', officialStartDate: '2024-05-01', floorplanPath: 'map.svg' },
      projects: [{ id: 9, name: 'Old project' }],
    };
    eventguideService.getProjects.mockResolvedValue(payload);

    await expect(controller.getEventProjects(3)).resolves.toEqual(payload);
    expect(eventguideService.getProjects).toHaveBeenCalledWith(3);
  });
});
