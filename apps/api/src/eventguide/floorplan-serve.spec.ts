import type { Mock } from 'vitest';
import { NotFoundException, StreamableFile } from '@nestjs/common';
import { access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as path from 'node:path';
import { EventguideService } from './eventguide.service';
import { getFloorplanDir } from './floorplan-path';

vi.mock('node:fs/promises', async () => ({
  ...(await vi.importActual('node:fs/promises')),
  access: vi.fn(),
}));

vi.mock('node:fs', async () => ({
  ...(await vi.importActual('node:fs')),
  createReadStream: vi.fn(),
}));

vi.mock('./floorplan-path', async () => ({
  ...(await vi.importActual('./floorplan-path')),
  getFloorplanDir: vi.fn(),
}));

describe('EventguideService floorplan serving', () => {
  const service = new EventguideService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';
    (getFloorplanDir as Mock).mockReturnValue('/tmp/uploads/floorplans');
    (createReadStream as Mock).mockReturnValue('stream');
  });

  it('returns a streamable floor plan file', async () => {
    (access as Mock).mockResolvedValue(undefined);

    const result = await service.getFloorplan('cp2025_zaal.svg');

    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('returns the resolved path for a valid filename', async () => {
    (access as Mock).mockResolvedValue(undefined);

    const result = await service.getFloorplanFilePath('cp2025_zaal.svg');

    expect(result).toBe(
      path.join('/tmp/uploads/floorplans', 'cp2025_zaal.svg'),
    );
  });

  it('throws when the filename is unsafe', async () => {
    await expect(
      service.getFloorplanFilePath('../secret.svg'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the file does not exist', async () => {
    (access as Mock).mockRejectedValue(new Error('ENOENT'));

    await expect(
      service.getFloorplanFilePath('missing.svg'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
