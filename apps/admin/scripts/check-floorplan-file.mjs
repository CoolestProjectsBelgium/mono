import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
const svg = readFileSync(file, 'utf8');
console.log(JSON.stringify({
  exists: existsSync(file),
  size: svg.length,
  corruptAttr: /[xy]="-?\d+\.?\d*<g id="table_/i.test(svg),
  corruptText: /<text[^>]*<g id="table_/i.test(svg),
  tables: (svg.match(/id="table_/g) ?? []).length,
  viewBox: svg.match(/viewBox="([^"]+)"/i)?.[1] ?? null,
}, null, 2));
