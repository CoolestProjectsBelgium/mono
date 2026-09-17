import type { Mock } from 'vitest';
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
import { createReadStream } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { EventguideService } from './eventguide.service';

vi.mock('node:fs/promises', async () => ({
  ...(await vi.importActual('node:fs/promises')),
  access: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('node:fs', async () => ({
  ...(await vi.importActual('node:fs')),
  createReadStream: vi.fn(),
}));

describe('EventguideService', () => {
  let service: EventguideService;

  const eventModel = {
    findByPk: vi.fn(),
  };
  const projectModel = {
    findAll: vi.fn(),
    findOne: vi.fn(),
  };
  const eventTableModel = {};
  const userProjectModel = {
    findAll: vi.fn(),
  };
  const userModel = {
    findAll: vi.fn(),
  };
  const questionModel = {
    findOne: vi.fn(),
  };
  const questionUserModel = {
    findAll: vi.fn(),
    count: vi.fn(),
  };
  const attachmentModel = {
    findOne: vi.fn(),
  };

  const originalApiBaseUrl = process.env.API_BASE_URL;

  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.API_BASE_URL;

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

  afterEach(() => {
    if (originalApiBaseUrl === undefined) {
      delete process.env.API_BASE_URL;
    } else {
      process.env.API_BASE_URL = originalApiBaseUrl;
    }
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
    expect(result.event.floorplanPath).toBe(
      'eventguide/floorplans/floorplan_active.svg',
    );
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]).toMatchObject({
      id: 5,
      tableNumber: 26,
      tableName: 'Tafel_26',
      participants: ['Alex Owner', 'Sam Helper'],
      agreedToPhoto: false,
      thumbnailUrl: '/eventguide/attachments/99/thumbnail',
    });
  });

  it('omits projects without a parseable table assignment', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Coolest Projects',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue(null);
    projectModel.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'On map',
        description: 'Has table',
        language: 'nl',
        table: { name: 'Tafel_01' },
        attachments: [],
      },
      {
        id: 2,
        name: 'No table',
        description: 'Unassigned',
        language: 'nl',
        table: null,
        attachments: [],
      },
      {
        id: 3,
        name: 'Bad table name',
        description: 'Unparseable',
        language: 'nl',
        table: { name: 'Lobby' },
        attachments: [],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([]);
    userModel.findAll.mockResolvedValue([]);

    const result = await service.getProjects(1);

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].id).toBe(1);
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
    expect(result.projects[0].thumbnailUrl).toContain(
      '/eventguide/attachments/42/thumbnail',
    );
  });

  it('throws when the event does not exist', async () => {
    eventModel.findByPk.mockResolvedValue(null);

    await expect(service.getProjects(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects thumbnails for unconfirmed attachments', async () => {
    attachmentModel.findOne.mockResolvedValue(null);

    await expect(service.getThumbnailByAttachmentId(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('serves confirmed thumbnails without full photo consent', async () => {
    attachmentModel.findOne.mockResolvedValue({
      id: 42,
      eventId: 1,
      projectId: 5,
      confirmed: true,
      thumbnailPath: '/uploads/project_5/thumb.jpg',
      filepath: '/uploads/project_5/photo.jpg',
      mimetype: 'image/jpeg',
    });
    projectModel.findOne.mockResolvedValue({
      id: 5,
      eventId: 1,
      deletedAt: null,
    });
    (access as Mock).mockResolvedValue(undefined);
    (createReadStream as Mock).mockReturnValue('stream');

    const result = await service.getThumbnailByAttachmentId(42);

    expect(result).toBeDefined();
    expect(createReadStream).toHaveBeenCalledWith('/uploads/project_5/thumb.jpg');
    expect(questionUserModel.count).not.toHaveBeenCalled();
  });

  it('builds a self-contained archive with the photo inlined as a data URI', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Coolest Projects',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue(null);
    projectModel.findAll.mockResolvedValue([
      {
        id: 5,
        name: 'Robot Dog',
        description: 'A walking robot',
        language: 'nl',
        table: { name: 'Tafel_03' },
        attachments: [
          {
            id: 42,
            mimetype: 'image/jpeg',
            thumbnailPath: '/uploads/project_5/thumb.jpg',
            filepath: '/uploads/project_5/photo.jpg',
          },
        ],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([]);
    userModel.findAll.mockResolvedValue([]);
    (access as Mock).mockResolvedValue(undefined);
    (readFile as Mock).mockResolvedValue(Buffer.from('fake-image'));

    const html = await service.getProjectsArchiveHtml(1);

    expect(readFile).toHaveBeenCalledWith('/uploads/project_5/thumb.jpg');
    const output = html.toString('utf8');
    expect(output).toContain('Coolest Projects');
    expect(output).toContain('Robot Dog');
    // Handlebars HTML-escapes the base64 `=` padding as `&#x3D;`, which
    // browsers decode back to `=` inside an attribute value — so we assert
    // on the unpadded payload rather than the raw base64 string.
    const base64Payload = Buffer.from('fake-image')
      .toString('base64')
      .replace(/=+$/, '');
    expect(output).toContain(`data:image/jpeg;base64,${base64Payload}`);
  });

  it('excludes projects without a table assignment, matching getProjects', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Coolest Projects',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue(null);
    projectModel.findAll.mockResolvedValue([
      {
        id: 5,
        name: 'On map',
        description: 'Has table',
        language: 'nl',
        table: { name: 'Tafel_01' },
        attachments: [],
      },
      {
        id: 6,
        name: 'No table',
        description: 'Unassigned',
        language: 'nl',
        table: null,
        attachments: [],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([]);
    userModel.findAll.mockResolvedValue([]);

    const output = (await service.getProjectsArchiveHtml(1)).toString('utf8');

    expect(output).toContain('On map');
    expect(output).not.toContain('No table');
  });

  it('omits the image when the attachment file cannot be read', async () => {
    eventModel.findByPk.mockResolvedValue({
      id: 1,
      eventTitle: 'Event',
      officialStartDate: new Date('2026-05-01T10:00:00.000Z'),
      floorplanPath: 'floorplan_active.svg',
    });
    questionModel.findOne.mockResolvedValue(null);
    projectModel.findAll.mockResolvedValue([
      {
        id: 5,
        name: 'Robot Dog',
        description: 'A walking robot',
        language: 'nl',
        table: { name: 'Tafel_03' },
        attachments: [
          {
            id: 42,
            mimetype: 'image/jpeg',
            thumbnailPath: '/uploads/project_5/thumb.jpg',
            filepath: '/uploads/project_5/photo.jpg',
          },
        ],
      },
    ]);
    userProjectModel.findAll.mockResolvedValue([]);
    userModel.findAll.mockResolvedValue([]);
    (access as Mock).mockRejectedValue(new Error('missing'));

    const html = await service.getProjectsArchiveHtml(1);

    expect(html.toString('utf8')).not.toContain('<img');
  });

  it('falls back to the original filepath when the thumbnail file is missing', async () => {
    attachmentModel.findOne.mockResolvedValue({
      id: 42,
      eventId: 1,
      projectId: 5,
      confirmed: true,
      thumbnailPath: '/uploads/project_5/thumb.jpg',
      filepath: '/uploads/project_5/photo.jpg',
      mimetype: 'image/jpeg',
    });
    projectModel.findOne.mockResolvedValue({
      id: 5,
      eventId: 1,
      deletedAt: null,
    });
    (access as Mock)
      .mockRejectedValueOnce(new Error('missing thumb'))
      .mockResolvedValueOnce(undefined);
    (createReadStream as Mock).mockReturnValue('stream');

    await service.getThumbnail(1, 42);

    expect(createReadStream).toHaveBeenCalledWith('/uploads/project_5/photo.jpg');
  });
});
