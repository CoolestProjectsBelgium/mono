import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

export interface SeedMunicipalityEntry {
  postalcode: number;
  municipality_name_nl: string;
  municipality_name_fr: string;
  municipality_name_de: string;
}

export function loadSeedMunicipalities(): SeedMunicipalityEntry[] {
  const candidates = [
    path.join(process.cwd(), 'src', 'seeder', 'be-municipalities.json'),
    path.join(__dirname, 'be-municipalities.json'),
  ];
  const file = candidates.find((candidate) => existsSync(candidate));
  if (!file) {
    throw new Error(
      'Seed municipalities file not found (src/seeder/be-municipalities.json)',
    );
  }

  const entries = JSON.parse(readFileSync(file, 'utf8')) as Array<{
    postalcode?: number;
    municipality_name_nl?: string;
    municipality_name_fr?: string;
    municipality_name_de?: string;
  }>;

  const seen = new Set<number>();
  const result: SeedMunicipalityEntry[] = [];
  for (const entry of entries) {
    const postalcode = Number(entry.postalcode);
    const nl = (entry.municipality_name_nl ?? '').trim();
    if (!Number.isInteger(postalcode) || !nl || seen.has(postalcode)) {
      continue;
    }
    seen.add(postalcode);
    result.push({
      postalcode,
      municipality_name_nl: nl,
      municipality_name_fr: (entry.municipality_name_fr ?? nl).trim(),
      municipality_name_de: (entry.municipality_name_de ?? nl).trim(),
    });
  }

  if (result.length < 100) {
    throw new Error(
      `Unexpected municipality seed payload: expected many entries, got ${result.length}`,
    );
  }
  return result;
}
