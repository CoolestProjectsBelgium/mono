import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  Attachment,
  Event,
  PresentationRender,
  PresentationSlide,
  Project,
} from '@coolestprojects/database';
import { PresentationService } from './presentation.service';

const screenshot = jest.fn().mockResolvedValue(Buffer.from('fake-png'));
const newPage = jest.fn().mockResolvedValue({
  setViewport: jest.fn().mockResolvedValue(undefined),
  setContent: jest.fn().mockResolvedValue(undefined),
  screenshot,
});
const closeBrowser = jest.fn().mockResolvedValue(undefined);
const launch = jest.fn().mockResolvedValue({ newPage, close: closeBrowser });

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: (...args: unknown[]) => launch(...args) },
}));

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('cached-png')),
}));

describe('PresentationService', () => {
  let service: PresentationService;
  let eventFindByPk: jest.Mock;
  let projectFindAll: jest.Mock;
  let presentationSlideFindAll: jest.Mock;
  let presentationSlideFindOne: jest.Mock;
  let presentationRenderFindAll: jest.Mock;
  let presentationRenderFindOne: jest.Mock;
  let presentationRenderCreate: jest.Mock;

  const event = {
    id: 1,
    eventTitle: 'Coolest Projects',
    eventBeginDate: new Date('2026-06-01'),
    eventEndDate: new Date('2026-06-02'),
    registrationOpenDate: new Date('2026-01-01'),
    registrationClosedDate: new Date('2026-05-01'),
    projectClosedDate: new Date('2026-05-15'),
    officialStartDate: new Date('2026-06-01'),
    floorplanPath: 'zaal.svg',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';

    eventFindByPk = jest.fn().mockResolvedValue(event);
    projectFindAll = jest.fn().mockResolvedValue([]);
    presentationSlideFindAll = jest.fn().mockResolvedValue([]);
    presentationSlideFindOne = jest.fn().mockResolvedValue(null);
    presentationRenderFindAll = jest.fn().mockResolvedValue([]);
    presentationRenderFindOne = jest.fn().mockResolvedValue(null);
    presentationRenderCreate = jest.fn().mockImplementation((data) =>
      Promise.resolve({
        ...data,
        update: jest.fn().mockResolvedValue(undefined),
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresentationService,
        {
          provide: getModelToken(Event),
          useValue: { findByPk: eventFindByPk },
        },
        {
          provide: getModelToken(Project),
          useValue: { findAll: projectFindAll },
        },
        { provide: getModelToken(Attachment), useValue: {} },
        {
          provide: getModelToken(PresentationSlide),
          useValue: {
            findAll: presentationSlideFindAll,
            findOne: presentationSlideFindOne,
          },
        },
        {
          provide: getModelToken(PresentationRender),
          useValue: {
            findAll: presentationRenderFindAll,
            findOne: presentationRenderFindOne,
            create: presentationRenderCreate,
          },
        },
      ],
    }).compile();

    service = module.get<PresentationService>(PresentationService);
  });

  function tabledProject(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 1,
      name: 'Robot Dog',
      description: 'A dog that is also a robot',
      language: 'en',
      table: { name: 'Tafel_5' },
      attachments: [],
      ...overrides,
    };
  }

  describe('listSlides', () => {
    it('throws when the event does not exist', async () => {
      eventFindByPk.mockResolvedValue(null);

      await expect(service.listSlides(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('expands a perRecord/projects config into one slide per visible project, in table order', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 10,
          order: 0,
          time: 20,
          dataSource: 'projects',
          cardinality: 'perRecord',
          body: '{{record.name}}',
          imagePath: null,
        },
      ]);
      projectFindAll.mockResolvedValue([
        tabledProject({ id: 2, name: 'B project', table: { name: 'Tafel_9' } }),
        tabledProject({ id: 1, name: 'A project', table: { name: 'Tafel_3' } }),
      ]);

      const { slides } = await service.listSlides(1);

      expect(slides.map((slide) => slide.key)).toEqual([
        'slide-10-1',
        'slide-10-2',
      ]);
    });

    it('excludes projects with no table assignment entirely', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 10,
          order: 0,
          time: 20,
          dataSource: 'projects',
          cardinality: 'perRecord',
          body: 'x',
          imagePath: null,
        },
      ]);
      projectFindAll.mockResolvedValue([tabledProject({ id: 1 })]);

      await service.listSlides(1);

      // The visibility filter is a query-level `required: true` include —
      // confirm the query actually asks for it, not just that a JS filter
      // happens to hide untabled projects afterwards.
      expect(projectFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ required: true }),
          ]),
        }),
      );
    });

    it('produces exactly one overview slide for a single/projects config, regardless of project count', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 11,
          order: 0,
          time: 20,
          dataSource: 'projects',
          cardinality: 'single',
          body: 'overview',
          imagePath: null,
        },
      ]);
      projectFindAll.mockResolvedValue([
        tabledProject({ id: 1 }),
        tabledProject({ id: 2 }),
      ]);

      const { slides } = await service.listSlides(1);

      expect(slides).toHaveLength(1);
      expect(slides[0].key).toBe('slide-11');
    });

    it('produces one slide for a none-sourced (custom/static) config', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 12,
          order: 0,
          time: 10,
          dataSource: 'none',
          cardinality: 'single',
          body: '<h1>Sponsor</h1>',
          imagePath: null,
        },
      ]);

      const { slides } = await service.listSlides(1);

      expect(slides).toEqual([
        expect.objectContaining({ key: 'slide-12', order: 0, time: 10 }),
      ]);
      expect(projectFindAll).not.toHaveBeenCalled();
    });

    it('keeps the same hash across calls when nothing changed, and changes it when the body changes', async () => {
      const config = {
        id: 12,
        order: 0,
        time: 10,
        dataSource: 'none',
        cardinality: 'single',
        body: '<h1>v1</h1>',
        imagePath: null,
      };
      presentationSlideFindAll.mockResolvedValue([config]);

      const first = await service.listSlides(1);

      presentationSlideFindAll.mockResolvedValue([
        { ...config, body: '<h1>v2</h1>' },
      ]);
      const second = await service.listSlides(1);

      expect(first.slides[0].hash).not.toBe(second.slides[0].hash);
      expect(first.hash).not.toBe(second.hash);
    });

    it('never touches Puppeteer just to list slides', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 10,
          order: 0,
          time: 20,
          dataSource: 'projects',
          cardinality: 'perRecord',
          body: 'x',
          imagePath: null,
        },
      ]);
      projectFindAll.mockResolvedValue([tabledProject()]);

      await service.listSlides(1);

      expect(launch).not.toHaveBeenCalled();
    });
  });

  describe('getSlideMeta', () => {
    it('never renders — reports generatedAt: null when nothing is cached yet', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 12,
          order: 0,
          time: 10,
          dataSource: 'none',
          cardinality: 'single',
          body: 'x',
          imagePath: null,
        },
      ]);

      const meta = await service.getSlideMeta(1, 'slide-12');

      expect(meta.generatedAt).toBeNull();
      expect(launch).not.toHaveBeenCalled();
    });

    it('reports the cached generatedAt when the hash still matches', async () => {
      const config = {
        id: 12,
        order: 0,
        time: 10,
        dataSource: 'none',
        cardinality: 'single',
        body: 'x',
        imagePath: null,
      };
      presentationSlideFindAll.mockResolvedValue([config]);

      const hash = (await service.getSlideMeta(1, 'slide-12')).hash;
      const generatedAt = new Date();
      presentationRenderFindOne.mockResolvedValue({
        contentHash: hash,
        generatedAt,
        imagePath: 'slide-12.png',
      });

      const meta = await service.getSlideMeta(1, 'slide-12');

      expect(meta.generatedAt).toBe(generatedAt);
      expect(launch).not.toHaveBeenCalled();
    });

    it('throws for an unknown slide key', async () => {
      presentationSlideFindAll.mockResolvedValue([]);

      await expect(service.getSlideMeta(1, 'slide-999')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getSlideImage', () => {
    it('renders via Puppeteer and caches on a miss', async () => {
      presentationSlideFindAll.mockResolvedValue([
        {
          id: 12,
          order: 0,
          time: 10,
          dataSource: 'none',
          cardinality: 'single',
          body: '<h1>hi</h1>',
          imagePath: null,
        },
      ]);

      const result = await service.getSlideImage(1, 'slide-12');

      expect(launch).toHaveBeenCalledTimes(1);
      expect(presentationRenderCreate).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: 1, slideKey: 'slide-12' }),
      );
      expect(result.hash).toBeTruthy();
    });

    it('skips Puppeteer entirely on a cache hit', async () => {
      const config = {
        id: 12,
        order: 0,
        time: 10,
        dataSource: 'none',
        cardinality: 'single',
        body: '<h1>hi</h1>',
        imagePath: null,
      };
      presentationSlideFindAll.mockResolvedValue([config]);

      const first = await service.getSlideImage(1, 'slide-12');
      presentationRenderFindOne.mockResolvedValue({
        contentHash: first.hash,
        generatedAt: first.generatedAt,
        imagePath: 'slide-12.png',
      });
      launch.mockClear();

      await service.getSlideImage(1, 'slide-12');

      expect(launch).not.toHaveBeenCalled();
    });

    it('re-renders when the cached hash no longer matches the current content', async () => {
      const config = {
        id: 12,
        order: 0,
        time: 10,
        dataSource: 'none',
        cardinality: 'single',
        body: '<h1>v1</h1>',
        imagePath: null,
      };
      presentationSlideFindAll.mockResolvedValue([config]);

      const first = await service.getSlideImage(1, 'slide-12');
      presentationRenderFindOne.mockResolvedValue({
        contentHash: first.hash,
        generatedAt: first.generatedAt,
        imagePath: 'slide-12.png',
        update: jest.fn().mockResolvedValue(undefined),
      });
      presentationSlideFindAll.mockResolvedValue([
        { ...config, body: '<h1>v2</h1>' },
      ]);
      launch.mockClear();

      await service.getSlideImage(1, 'slide-12');

      expect(launch).toHaveBeenCalledTimes(1);
    });
  });

  describe('previewSlideDraft', () => {
    it('throws when the slide does not exist', async () => {
      presentationSlideFindOne.mockResolvedValue(null);

      await expect(
        service.previewSlideDraft(1, { slideId: 999, body: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('renders a none-sourced slide with the caller-supplied body, without touching the render cache or disk', async () => {
      presentationSlideFindOne.mockResolvedValue({
        id: 12,
        dataSource: 'none',
        cardinality: 'single',
        imagePath: null,
      });

      const { writeFile } = jest.requireMock('node:fs/promises') as {
        writeFile: jest.Mock;
      };
      writeFile.mockClear();

      const buffer = await service.previewSlideDraft(1, {
        slideId: 12,
        body: '<h1>draft</h1>',
      });

      expect(buffer).toEqual(Buffer.from('fake-png'));
      expect(launch).toHaveBeenCalledTimes(1);
      expect(writeFile).not.toHaveBeenCalled();
      expect(presentationRenderCreate).not.toHaveBeenCalled();
      expect(projectFindAll).not.toHaveBeenCalled();
    });

    it('renders a single/projects slide against every visible project', async () => {
      presentationSlideFindOne.mockResolvedValue({
        id: 11,
        dataSource: 'projects',
        cardinality: 'single',
        imagePath: null,
      });
      projectFindAll.mockResolvedValue([
        tabledProject({ id: 1 }),
        tabledProject({ id: 2 }),
      ]);

      await service.previewSlideDraft(1, {
        slideId: 11,
        body: '{{records.length}}',
      });

      expect(projectFindAll).toHaveBeenCalledTimes(1);
      expect(launch).toHaveBeenCalledTimes(1);
    });

    it('renders a perRecord/projects slide against the requested project', async () => {
      presentationSlideFindOne.mockResolvedValue({
        id: 10,
        dataSource: 'projects',
        cardinality: 'perRecord',
        imagePath: null,
      });
      projectFindAll.mockResolvedValue([
        tabledProject({ id: 1, name: 'A project' }),
        tabledProject({ id: 2, name: 'B project' }),
      ]);

      await service.previewSlideDraft(1, {
        slideId: 10,
        body: '{{record.name}}',
        projectId: 2,
      });

      expect(launch).toHaveBeenCalledTimes(1);
    });

    it('falls back to the first visible project when no projectId is given', async () => {
      presentationSlideFindOne.mockResolvedValue({
        id: 10,
        dataSource: 'projects',
        cardinality: 'perRecord',
        imagePath: null,
      });
      projectFindAll.mockResolvedValue([tabledProject({ id: 1 })]);

      await expect(
        service.previewSlideDraft(1, { slideId: 10, body: '{{record.name}}' }),
      ).resolves.toEqual(Buffer.from('fake-png'));
    });

    it('throws when a perRecord/projects slide has no visible project to preview with', async () => {
      presentationSlideFindOne.mockResolvedValue({
        id: 10,
        dataSource: 'projects',
        cardinality: 'perRecord',
        imagePath: null,
      });
      projectFindAll.mockResolvedValue([]);

      await expect(
        service.previewSlideDraft(1, { slideId: 10, body: '{{record.name}}' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listVisibleProjectOptions', () => {
    it('maps visible projects to id/name options', async () => {
      projectFindAll.mockResolvedValue([
        tabledProject({ id: 1, name: 'A project' }),
        tabledProject({ id: 2, name: 'B project' }),
      ]);

      const options = await service.listVisibleProjectOptions(1);

      expect(options).toEqual(
        expect.arrayContaining([
          { id: 1, name: 'A project' },
          { id: 2, name: 'B project' },
        ]),
      );
    });
  });
});
