import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { AdminService } from './admin.service';
import { getFloorplanDir } from '../eventguide/floorplan-path';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('../eventguide/floorplan-path', () => ({
  ...jest.requireActual('../eventguide/floorplan-path'),
  getFloorplanDir: jest.fn(),
}));

describe('AdminService floorplans', () => {
  const eventModel = {
    findByPk: jest.fn(),
    update: jest.fn(),
  };
  const service = new AdminService(eventModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.UPLOAD_ROOT = '/tmp/uploads';
    (getFloorplanDir as jest.Mock).mockReturnValue('/tmp/uploads/floorplans');
  });

  it('lists floorplans and marks the active event file', async () => {
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'cp2025_zaal.svg' });
    (readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'cp2025_zaal.svg' },
      { isFile: () => true, name: '../secret.svg' },
      { isFile: () => true, name: 'other.svg' },
    ]);
    (stat as jest.Mock).mockImplementation(async (filePath: string) => ({
      mtime: filePath.endsWith('other.svg')
        ? new Date('2026-01-02T00:00:00.000Z')
        : new Date('2026-01-01T00:00:00.000Z'),
    }));

    const result = await service.listFloorplans(1);

    expect(result.activeFilename).toBe('cp2025_zaal.svg');
    expect(result.floorplans).toHaveLength(2);
    expect(result.floorplans.find((item) => item.filename === 'cp2025_zaal.svg')?.isActive).toBe(true);
    expect(result.floorplans.find((item) => item.filename === 'other.svg')?.isActive).toBe(false);
  });

  it('uploads a processed SVG and activates it for the event', async () => {
    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g id="group1">
          <title>Tafel.1</title>
          <text>26.</text>
        </g>
      </svg>
    `;
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'grondplan-cp-2026.svg' });
    (readdir as jest.Mock).mockResolvedValue([{ isFile: () => true, name: 'map.svg' }]);
    (stat as jest.Mock).mockResolvedValue({ mtime: new Date('2026-01-01T00:00:00.000Z') });

    const result = await service.uploadFloorplan(1, {
      svgContent: svg,
      originalName: 'Grondplan CP 2026.svg',
    });

    expect(writeFile).toHaveBeenCalledWith(
      path.join('/tmp/uploads/floorplans', 'grondplan-cp-2026.svg'),
      expect.stringContaining('id="table_26"'),
      'utf8',
    );
    expect(eventModel.update).toHaveBeenCalledWith(
      { floorplanPath: 'grondplan-cp-2026.svg' },
      { where: { id: 1 } },
    );
    expect(result.activeFilename).toBe('grondplan-cp-2026.svg');
  });

  it('rejects corrupt SVG uploads', async () => {
    await expect(
      service.uploadFloorplan(1, {
        svgContent: '<text><g id="table_01"></g></text>',
        originalName: 'bad.svg',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('activates an existing floorplan file', async () => {
    eventModel.findByPk.mockResolvedValue({ floorplanPath: 'cp2025_zaal.svg' });
    (readdir as jest.Mock).mockResolvedValue([{ isFile: () => true, name: 'cp2025_zaal.svg' }]);
    (stat as jest.Mock).mockResolvedValue({ mtime: new Date('2026-01-01T00:00:00.000Z') });

    const result = await service.activateFloorplan(1, 'cp2025_zaal.svg');

    expect(eventModel.update).toHaveBeenCalledWith(
      { floorplanPath: 'cp2025_zaal.svg' },
      { where: { id: 1 } },
    );
    expect(result.floorplans[0]?.isActive).toBe(true);
  });

  it('rejects activating a missing floorplan file', async () => {
    (stat as jest.Mock).mockRejectedValue(new Error('ENOENT'));

    await expect(service.activateFloorplan(1, 'missing.svg')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
