import { NotFoundException, StreamableFile } from '@nestjs/common';
import { access } from 'node:fs/promises';
import * as path from 'node:path';
import { EventguideService } from './eventguide.service';
import { getFloorplanDir } from './floorplan-path';

jest.mock('node:fs/promises', () => ({
  access: jest.fn(),
}));

jest.mock('./floorplan-path', () => ({
  ...jest.requireActual('./floorplan-path'),
  getFloorplanDir: jest.fn(),
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
    jest.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';
    (getFloorplanDir as jest.Mock).mockReturnValue('/tmp/uploads/floorplans');
  });

  it('returns a streamable floor plan file', async () => {
    (access as jest.Mock).mockResolvedValue(undefined);

    const result = await service.getFloorplan('cp2025_zaal.svg');

    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('returns the resolved path for a valid filename', async () => {
    (access as jest.Mock).mockResolvedValue(undefined);

    const result = await service.getFloorplanFilePath('cp2025_zaal.svg');

    expect(result).toBe(path.join('/tmp/uploads/floorplans', 'cp2025_zaal.svg'));
  });

  it('throws when the filename is unsafe', async () => {
    await expect(service.getFloorplanFilePath('../secret.svg')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when the file does not exist', async () => {
    (access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

    await expect(service.getFloorplanFilePath('missing.svg')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
