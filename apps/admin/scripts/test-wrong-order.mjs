import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const svg = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');

// Reproduce old bug: inject CSS before ID replacements (wrong order).
function buggyProcess(svgContent) {
  const BLINK_CSS = `
@keyframes table-blink {
  from { opacity: 1; }
  to { opacity: 0.35; }
}
.table-highlight {
  animation: table-blink 1s ease-in-out infinite alternate;
}
`;
  let processed = svgContent.includes('<style')
    ? svgContent.replace(/<style([^>]*)>/, `<style$1>${BLINK_CSS}`)
    : svgContent.replace(/<svg\b([^>]*)>/, `<svg$1><style type="text/css"><![CDATA[${BLINK_CSS}]]></style>`);

  const result = processVisioSvg(svgContent);
  for (const replacement of result.tableNumbers.map(() => null)) {
    // use correct replacements from processVisioSvg but on CSS-injected string with original indices
  }
  return processed;
}

// Simpler: apply replacements on original, but inject CSS first into working copy
const result = processVisioSvg(svg);
const BLINK_CSS = `@keyframes table-blink { from { opacity: 1; } to { opacity: 0.35; } }`;

// Simulate wrong order manually
let searchFrom = 0;
const replacements = [];
while (true) {
  const titleIndex = svg.indexOf('<title>Tafel.', searchFrom);
  if (titleIndex === -1) break;
  const groupStart = svg.lastIndexOf('<g', titleIndex);
  if (groupStart === -1) break;
  let depth = 0;
  const groupTagPattern = /<(\/?)g\b/g;
  groupTagPattern.lastIndex = groupStart;
  let match;
  let end = -1;
  while ((match = groupTagPattern.exec(svg)) !== null) {
    if (match[1] === '') depth += 1;
    else depth -= 1;
    if (depth === 0) { end = groupTagPattern.lastIndex; break; }
  }
  if (end === -1) break;
  const groupMarkup = svg.slice(groupStart, end);
  const numMatch = groupMarkup.match(/<text[^>]*>[\s\S]*?(\d+)\s*\.?\s*<\/text>/i);
  if (numMatch) {
    const tableNumber = Number.parseInt(numMatch[1], 10);
    const id = `table_${String(tableNumber).padStart(2, '0')}`;
    const replacement = /\sid="[^"]*"/i.test(groupMarkup)
      ? groupMarkup.replace(/\sid="[^"]*"/i, ` id="${id}"`)
      : groupMarkup.replace(/^<g\b/i, `<g id="${id}"`);
    replacements.push({ start: groupStart, end, replacement });
  }
  searchFrom = end;
}

let wrongOrder = svg;
if (wrongOrder.includes('<style')) {
  wrongOrder = wrongOrder.replace(/<style([^>]*)>/, `<style$1>${BLINK_CSS}`);
}
for (const r of replacements.sort((a, b) => b.start - a.start)) {
  wrongOrder = `${wrongOrder.slice(0, r.start)}${r.replacement}${wrongOrder.slice(r.end)}`;
}

console.log(JSON.stringify({
  correct: isProcessedSvgCorrupt(result.processedSvg),
  wrongOrder: isProcessedSvgCorrupt(wrongOrder),
}, null, 2));
