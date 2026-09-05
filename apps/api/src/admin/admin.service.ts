import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '@coolestprojects/database';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import {
  FloorplansOverviewDto,
  UploadFloorplanDto,
} from '../dto/floorplans-overview.dto';
import {
  getFloorplanDir,
  resolveFloorplanFilePath,
  sanitizeFloorplanFilename,
} from '../eventguide/floorplan-path';
import {
  isProcessedSvgCorrupt,
  processVisioSvg,
} from '../eventguide/process-visio-svg';

function slugifyFilename(originalName: string): string {
  const base = path.basename(originalName, path.extname(originalName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'floorplan'}.svg`;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async listFloorplans(eventId: number): Promise<FloorplansOverviewDto> {
    const floorplanDir = getFloorplanDir();
    await mkdir(floorplanDir, { recursive: true });

    const event = await this.eventModel.findByPk(eventId, {
      attributes: ['floorplanPath'],
    });
    const activeFilename = event?.floorplanPath ?? null;

    const entries = await readdir(floorplanDir, { withFileTypes: true });
    const floorplans = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && sanitizeFloorplanFilename(entry.name))
        .map(async (entry) => {
          const filePath = path.join(floorplanDir, entry.name);
          const fileStat = await stat(filePath);
          return {
            filename: entry.name,
            uploadedAt: fileStat.mtime.toISOString(),
            isActive: entry.name === activeFilename,
          };
        }),
    );

    floorplans.sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));

    return {
      floorplans,
      activeFilename,
    };
  }

  async uploadFloorplan(
    eventId: number,
    body: UploadFloorplanDto,
  ): Promise<FloorplansOverviewDto> {
    const svgContent = String(body.svgContent ?? '');
    const originalName = String(body.originalName ?? 'floorplan.svg');

    if (!svgContent.trim().startsWith('<')) {
      throw new BadRequestException('Upload must be an SVG file');
    }
    if (isProcessedSvgCorrupt(svgContent)) {
      throw new BadRequestException(
        'This SVG looks corrupted. Upload the original Visio export, not a previously processed floor plan.',
      );
    }

    const processed = processVisioSvg(svgContent);
    if (processed.tableNumbers.length === 0) {
      throw new BadRequestException('No tables were detected in this SVG');
    }
    if (isProcessedSvgCorrupt(processed.processedSvg)) {
      throw new BadRequestException('Floor plan processing failed: SVG structure was corrupted');
    }

    const filename = slugifyFilename(originalName);
    const floorplanDir = getFloorplanDir();
    await mkdir(floorplanDir, { recursive: true });
    await writeFile(path.join(floorplanDir, filename), processed.processedSvg, 'utf8');
    await this.eventModel.update({ floorplanPath: filename }, { where: { id: eventId } });

    return this.listFloorplans(eventId);
  }

  async activateFloorplan(
    eventId: number,
    filename: string,
  ): Promise<FloorplansOverviewDto> {
    const safeFilename = sanitizeFloorplanFilename(filename);
    if (!safeFilename) {
      throw new BadRequestException('Invalid floor plan filename');
    }

    const filePath = resolveFloorplanFilePath(safeFilename);
    if (!filePath) {
      throw new NotFoundException('Floor plan file not found');
    }

    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('Floor plan file not found');
    }

    await this.eventModel.update({ floorplanPath: safeFilename }, { where: { id: eventId } });

    return this.listFloorplans(eventId);
  }
}
