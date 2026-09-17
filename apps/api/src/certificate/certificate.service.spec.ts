import type { Mock } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  Award,
  Certificate,
  CertificateRender,
  CertificateTemplate,
  Event,
  Project,
  User,
  UserProject,
} from '@coolestprojects/database';
import { CertificateService } from './certificate.service';

const pdf = vi.fn().mockResolvedValue(Buffer.from('fake-pdf'));
const newPage = vi.fn().mockResolvedValue({
  setContent: vi.fn().mockResolvedValue(undefined),
  pdf,
});
const closeBrowser = vi.fn().mockResolvedValue(undefined);
const launch = vi.fn().mockResolvedValue({ newPage, close: closeBrowser });

vi.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: (...args: unknown[]) => launch(...args) },
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(Buffer.from('cached-pdf')),
  readdir: vi.fn().mockRejectedValue(new Error('ENOENT')),
  stat: vi.fn(),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

describe('CertificateService', () => {
  let service: CertificateService;
  let eventFindByPk: Mock;
  let userProjectFindAll: Mock;
  let certificateFindAll: Mock;
  let certificateTemplateFindAll: Mock;
  let certificateTemplateFindOne: Mock;
  let certificateRenderFindAll: Mock;
  let certificateRenderFindOne: Mock;
  let certificateRenderCreate: Mock;
  let awardFindAll: Mock;

  const event = { id: 1, eventTitle: 'Coolest Projects' };

  const membership = (overrides: Partial<Record<string, unknown>> = {}) => ({
    projectId: 1,
    userId: 1,
    isOwner: true,
    project: { name: 'Robot Dog' },
    user: { firstname: 'Ada', lastname: 'Lovelace', language: 'en' },
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';

    eventFindByPk = vi.fn().mockResolvedValue(event);
    userProjectFindAll = vi.fn().mockResolvedValue([membership()]);
    certificateFindAll = vi.fn().mockResolvedValue([]);
    certificateTemplateFindAll = vi.fn().mockResolvedValue([
      { language: 'en', bodyHtml: '<p>{{participant.firstname}}</p>' },
    ]);
    certificateTemplateFindOne = vi
      .fn()
      .mockResolvedValue({ language: 'en', bodyHtml: '<p>{{participant.firstname}}</p>' });
    certificateRenderFindAll = vi.fn().mockResolvedValue([]);
    certificateRenderFindOne = vi.fn().mockResolvedValue(null);
    certificateRenderCreate = vi.fn().mockImplementation((data) =>
      Promise.resolve({
        ...data,
        update: vi.fn().mockResolvedValue(undefined),
      }),
    );
    awardFindAll = vi.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: getModelToken(Event), useValue: { findByPk: eventFindByPk } },
        { provide: getModelToken(Project), useValue: {} },
        { provide: getModelToken(User), useValue: {} },
        {
          provide: getModelToken(UserProject),
          useValue: { findAll: userProjectFindAll },
        },
        {
          provide: getModelToken(Certificate),
          useValue: { findAll: certificateFindAll },
        },
        {
          provide: getModelToken(CertificateTemplate),
          useValue: {
            findAll: certificateTemplateFindAll,
            findOne: certificateTemplateFindOne,
          },
        },
        {
          provide: getModelToken(CertificateRender),
          useValue: {
            findAll: certificateRenderFindAll,
            findOne: certificateRenderFindOne,
            create: certificateRenderCreate,
          },
        },
        { provide: getModelToken(Award), useValue: { findAll: awardFindAll } },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  describe('listParticipantStatus', () => {
    it('reports hasTemplate: false and never renders when no template exists for the language', async () => {
      certificateTemplateFindAll.mockResolvedValue([]);

      const [status] = await service.listParticipantStatus(1);

      expect(status.hasTemplate).toBe(false);
      expect(status.upToDate).toBe(false);
      expect(launch).not.toHaveBeenCalled();
    });

    it('reflects award-won status from the Award/VoteCategory join', async () => {
      awardFindAll.mockResolvedValue([
        {
          projectId: 1,
          categoryId: 5,
          text: 'Congratulations!',
          category: { name: 'Best design' },
        },
      ]);

      const [status] = await service.listParticipantStatus(1);

      expect(status.awardWon).toBe(true);
      expect(status.awardCategoryName).toBe('Best design');
      expect(launch).not.toHaveBeenCalled();
    });

    it('never touches Puppeteer just to list status', async () => {
      await service.listParticipantStatus(1);

      expect(launch).not.toHaveBeenCalled();
    });
  });

  describe('getCertificatePdf', () => {
    it('renders via Puppeteer and caches on a miss', async () => {
      const result = await service.getCertificatePdf(1, 1, 1);

      expect(launch).toHaveBeenCalledTimes(1);
      expect(certificateRenderCreate).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: 1, projectId: 1, userId: 1 }),
      );
      expect(result.hash).toBeTruthy();
    });

    it('skips Puppeteer entirely on a cache hit', async () => {
      const first = await service.getCertificatePdf(1, 1, 1);
      certificateRenderFindOne.mockResolvedValue({
        contentHash: first.hash,
        generatedAt: first.generatedAt,
        filePath: 'certificate-1-1.pdf',
      });
      launch.mockClear();

      await service.getCertificatePdf(1, 1, 1);

      expect(launch).not.toHaveBeenCalled();
    });

    it('re-renders when the cached hash no longer matches the current content', async () => {
      const first = await service.getCertificatePdf(1, 1, 1);
      certificateRenderFindOne.mockResolvedValue({
        contentHash: first.hash,
        generatedAt: first.generatedAt,
        filePath: 'certificate-1-1.pdf',
        update: vi.fn().mockResolvedValue(undefined),
      });
      certificateFindAll.mockResolvedValue([
        { projectId: 1, text: 'Updated text' },
      ]);
      launch.mockClear();

      await service.getCertificatePdf(1, 1, 1);

      expect(launch).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when no template exists for the participant language', async () => {
      certificateTemplateFindOne.mockResolvedValue(null);

      await expect(service.getCertificatePdf(1, 1, 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(launch).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for an unknown participant', async () => {
      await expect(service.getCertificatePdf(1, 1, 999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('previewCertificateDraft', () => {
    it('renders the caller-supplied text without writing to the render cache or disk', async () => {
      const { writeFile } = (await vi.importMock('node:fs/promises')) as {
        writeFile: Mock;
      };
      writeFile.mockClear();

      const buffer = await service.previewCertificateDraft(1, {
        projectId: 1,
        userId: 1,
        bodyHtml: '<p>{{certificate.text}}</p>',
        text: 'Draft text',
      });

      expect(buffer).toEqual(Buffer.from('fake-pdf'));
      expect(launch).toHaveBeenCalledTimes(1);
      expect(writeFile).not.toHaveBeenCalled();
      expect(certificateRenderCreate).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for an unknown participant', async () => {
      await expect(
        service.previewCertificateDraft(1, {
          projectId: 1,
          userId: 999,
          bodyHtml: '<p>x</p>',
          text: 'x',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
