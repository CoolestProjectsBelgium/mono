import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { Event as EventModel } from '@coolestprojects/database';
import { sequelize } from '../../database.js';
import { getFloorplanDir, sanitizeFloorplanFilename } from './floorplan-path.js';
import { processVisioSvg, isProcessedSvgCorrupt } from './process-visio-svg.js';

const Event = sequelize.models.Event as typeof EventModel;

export interface FloorplanListItem {
  filename: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface FloorplansOverview {
  floorplans: FloorplanListItem[];
  activeFilename: string | null;
}

async function listFloorplans(eventId: number): Promise<FloorplansOverview> {
  const floorplanDir = getFloorplanDir();
  await mkdir(floorplanDir, { recursive: true });

  const event = await Event.findByPk(eventId, { attributes: ['floorplanPath'] });
  const activeFilename = event?.floorplanPath ?? null;

  const entries = await readdir(floorplanDir, { withFileTypes: true });
  const floorplans = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
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

function slugifyFilename(originalName: string): string {
  const base = path.basename(originalName, path.extname(originalName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'floorplan'}.svg`;
}

export const Handler = async (request: any, _response: any, context: any): Promise<FloorplansOverview> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const payload = request.payload ?? {};

  if (request.method?.toLowerCase() === 'post') {
    if (payload.action === 'set-active') {
      const filename = sanitizeFloorplanFilename(String(payload.filename ?? ''));
      if (!filename) {
        throw new Error('Invalid floor plan filename');
      }

      const filePath = path.join(getFloorplanDir(), filename);
      try {
        await stat(filePath);
      } catch {
        throw new Error('Floor plan file not found');
      }

      await Event.update({ floorplanPath: filename }, { where: { id: eventId } });
    } else if (payload.action === 'upload') {
      const svgContent = String(payload.svgContent ?? '');
      const originalName = String(payload.originalName ?? 'floorplan.svg');

      if (!svgContent.trim().startsWith('<')) {
        throw new Error('Upload must be an SVG file');
      }
      if (isProcessedSvgCorrupt(svgContent)) {
        throw new Error(
          'This SVG looks corrupted. Upload the original Visio export, not a previously processed floor plan.',
        );
      }

      const processed = processVisioSvg(svgContent);
      if (processed.tableNumbers.length === 0) {
        throw new Error('No tables were detected in this SVG');
      }
      if (isProcessedSvgCorrupt(processed.processedSvg)) {
        throw new Error('Floor plan processing failed: SVG structure was corrupted');
      }

      const filename = slugifyFilename(originalName);
      const floorplanDir = getFloorplanDir();
      await mkdir(floorplanDir, { recursive: true });
      await writeFile(path.join(floorplanDir, filename), processed.processedSvg, 'utf8');
      await Event.update({ floorplanPath: filename }, { where: { id: eventId } });
    } else {
      throw new Error('Unknown action');
    }
  }

  return listFloorplans(eventId);
};

export { listFloorplans };
