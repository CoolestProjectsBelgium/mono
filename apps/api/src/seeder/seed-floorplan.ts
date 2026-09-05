import { copyFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';

const SEED_FLOORPLAN_FILENAME = 'cp2025_zaal.svg';

export async function seedFloorplan(uploadRoot: string): Promise<void> {
  const floorplanDir = path.join(uploadRoot, 'floorplans');
  await mkdir(floorplanDir, { recursive: true });

  const fixturePath = path.join(__dirname, 'fixtures', SEED_FLOORPLAN_FILENAME);
  const targetPath = path.join(floorplanDir, SEED_FLOORPLAN_FILENAME);
  await copyFile(fixturePath, targetPath);
}

export { SEED_FLOORPLAN_FILENAME };
