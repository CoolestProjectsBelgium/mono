import { BadRequestException, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArchivingController } from './archiving.controller';
import { EventguideService } from '../eventguide/eventguide.service';

async function readStreamableFile(file: StreamableFile): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of file.getStream()) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

describe('ArchivingController', () => {
  let controller: ArchivingController;

  const eventguideService = {
    getProjectsArchiveHtml: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivingController],
      providers: [{ provide: EventguideService, useValue: eventguideService }],
    }).compile();

    controller = module.get<ArchivingController>(ArchivingController);
  });

  it('downloads the projects archive for the admin-selected event', async () => {
    const html = Buffer.from('<html></html>');
    eventguideService.getProjectsArchiveHtml.mockResolvedValue(html);
    const res = { setHeader: vi.fn() };

    const result = await controller.downloadProjectsArchive(
      { user: { adminUser: { eventId: 6 } } },
      res as never,
    );

    expect(eventguideService.getProjectsArchiveHtml).toHaveBeenCalledWith(6);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/html; charset=utf-8',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="event-6-archive.html"',
    );
    await expect(readStreamableFile(result)).resolves.toEqual(html);
  });

  it('rejects the archive download when no event is selected', async () => {
    const res = { setHeader: vi.fn() };

    await expect(
      controller.downloadProjectsArchive({ user: undefined }, res as never),
    ).rejects.toThrow(BadRequestException);
  });
});
