import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Attachment,
  Event,
  EventTable,
  Project,
  Question,
  QuestionUser,
  User,
  UserProject,
} from '@coolestprojects/database';
import { EventguideService } from './eventguide.service';

describe('EventguideService', () => {
  let service: EventguideService;

  const eventModel = {
    findByPk: jest.fn(),
  };
  const projectModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  const eventTableModel = {};
  const userProjectModel = {
    findAll: jest.fn(),
  };
  const userModel = {
    findAll: jest.fn(),
  };
  const questionModel = {
    findOne: jest.fn(),
  };
  const questionUserModel = {
    findAll: jest.fn(),
    count: jest.fn(),
  };
  const attachmentModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventguideService,
        { provide: getModelToken(Event), useValue: eventModel },
        { provide: getModelToken(Project), useValue: projectModel },
        { provide: getModelToken(EventTable), useValue: eventTableModel },
        { provide: getModelToken(UserProject), useValue: userProjectModel },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(Question), useValue: questionModel },
        { provide: getModelToken(QuestionUser), useValue: questionUserModel },
        { provide: getModelToken(Attachment), useValue: attachmentModel },
      ],
    }).compile();

    service = module.get<EventguideService>(EventguideService);
  });

  it('maps projects with table numbers and photo consent', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Coolest Projects',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue({ id: 10 });
    projectModel.findAll.mockResolvedValue([
      {
        id: 5,
        name: 'Robot Dog',
        description: 'A walking robot',
        language: 'nl',
        table: { name: 'Tafel_26' },
        attachments: [{ id: 99 }],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([
      { projectId: 5, userId: 7, isOwner: true },
      { projectId: 5, userId: 8, isOwner: false },
    ]);
    userModel.findAll.mockResolvedValue([
      { id: 7, firstname: 'Alex', lastname: 'Owner' },
      { id: 8, firstname: 'Sam', lastname: 'Helper' },
    ]);
    questionUserModel.findAll.mockResolvedValue([{ userId: 7 }]);

    const result = await service.getProjects(1);

    expect(result.event.title).toBe('Coolest Projects');
    expect(result.event.floorplanPath).toBe('eventguide/floorplans/floorplan_active.svg');
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]).toMatchObject({
      id: 5,
      tableNumber: 26,
      tableName: 'Tafel_26',
      participants: ['Alex Owner', 'Sam Helper'],
      agreedToPhoto: false,
      thumbnailUrl: null,
    });
  });

  it('includes thumbnail URL when every participant agreed to photos', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Coolest Projects',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue({ id: 10 });
    projectModel.findAll.mockResolvedValue([
      {
        id: 5,
        name: 'Robot Dog',
        description: 'A walking robot',
        language: 'nl',
        table: { name: 'Tafel_03' },
        attachments: [{ id: 42 }],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([
      { projectId: 5, userId: 7, isOwner: true },
    ]);
    userModel.findAll.mockResolvedValue([
      { id: 7, firstname: 'Alex', lastname: 'Owner' },
    ]);
    questionUserModel.findAll.mockResolvedValue([{ userId: 7 }]);

    const result = await service.getProjects(1);

    expect(result.projects[0].agreedToPhoto).toBe(true);
    expect(result.projects[0].thumbnailUrl).toContain('/eventguide/attachments/42/thumbnail');
  });

  it('throws when the event does not exist', async () => {
    eventModel.findByPk.mockResolvedValue(null);

    await expect(service.getProjects(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects thumbnails for unconfirmed attachments', async () => {
    attachmentModel.findOne.mockResolvedValue(null);

    await expect(service.getThumbnailByAttachmentId(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
