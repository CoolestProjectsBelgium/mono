import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

export function loadSeedDojoNames(): string[] {
  const candidates = [
    path.join(process.cwd(), 'src', 'seeder', 'be-dojos.json'),
    path.join(__dirname, 'be-dojos.json'),
  ];
  const file = candidates.find((candidate) => existsSync(candidate));
  if (!file) {
    throw new Error('Seed dojos file not found (src/seeder/be-dojos.json)');
  }

  const entries = JSON.parse(readFileSync(file, 'utf8')) as Array<{ name?: string }>;
  const names = [
    ...new Set(
      entries
        .map((entry) => (entry.name ?? '').trim())
        .filter((name) => name.length > 0),
    ),
  ];
  if (names.length < 20) {
    throw new Error(`Unexpected dojo seed payload: expected many names, got ${names.length}`);
  }
  return names;
}
