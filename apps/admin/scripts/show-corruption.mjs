import { readFileSync } from 'node:fs';

const svg = readFileSync(process.argv[2], 'utf8');
const match = svg.match(/[xy]="-?\d+\.?\d*<g id="table_\d+"/i);
if (match) {
  const index = match.index ?? 0;
  console.log(svg.slice(Math.max(0, index - 120), index + 200));
} else {
  console.log('no corrupt attr match');
}

const textMatch = svg.match(/<text[^>]*<g id="table_/i);
if (textMatch) {
  const index = textMatch.index ?? 0;
  console.log('--- text corruption ---');
  console.log(svg.slice(Math.max(0, index - 80), index + 200));
}
