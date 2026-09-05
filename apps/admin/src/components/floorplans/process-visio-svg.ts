export interface ProcessVisioSvgResult {
  processedSvg: string;
  tableNumbers: number[];
  warnings: string[];
}

const BLINK_CSS = `
@keyframes table-blink {
  from { opacity: 1; }
  to { opacity: 0.35; }
}
.table-highlight {
  animation: table-blink 1s ease-in-out infinite alternate;
}
`;

const TABLE_NUMBER_PATTERN = /<text[^>]*>[\s\S]*?(\d+)\s*\.?\s*<\/text>/i;

function tableId(tableNumber: number): string {
  return `table_${String(tableNumber).padStart(2, '0')}`;
}

function injectBlinkCss(svg: string): string {
  if (svg.includes('table-blink')) {
    return svg;
  }
  if (svg.includes('<style')) {
    return svg.replace(/<style([^>]*)>/, `<style$1>${BLINK_CSS}`);
  }
  return svg.replace(/<svg\b([^>]*)>/, `<svg$1><style type="text/css"><![CDATA[${BLINK_CSS}]]></style>`);
}

function extractTableNumber(groupContent: string): number | null {
  const match = groupContent.match(TABLE_NUMBER_PATTERN);
  if (!match) {
    return null;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function findGroupBounds(svg: string, titleIndex: number): { start: number, end: number } | null {
  const groupStart = svg.lastIndexOf('<g', titleIndex);
  if (groupStart === -1) {
    return null;
  }

  let depth = 0;
  const groupTagPattern = /<(\/?)g\b/g;
  groupTagPattern.lastIndex = groupStart;

  let match: RegExpExecArray | null;
  while ((match = groupTagPattern.exec(svg)) !== null) {
    if (match[1] === '') {
      depth += 1;
    } else {
      depth -= 1;
    }

    if (depth === 0) {
      const end = groupTagPattern.lastIndex;
      return { start: groupStart, end };
    }
  }

  return null;
}

function replaceGroupId(groupMarkup: string, tableNumber: number): string {
  const id = tableId(tableNumber);
  if (/\sid="[^"]*"/i.test(groupMarkup)) {
    return groupMarkup.replace(/\sid="[^"]*"/i, ` id="${id}"`);
  }
  return groupMarkup.replace(/^<g\b/i, `<g id="${id}"`);
}

export function isProcessedSvgCorrupt(svg: string): boolean {
  return /<text[^>]*<g id="table_/i.test(svg)
    || /[xy]="-?\d+\.?\d*<g id="table_/i.test(svg);
}

export function processVisioSvg(svgContent: string): ProcessVisioSvgResult {
  const warnings: string[] = [];
  const tableNumbers: number[] = [];
  const seen = new Set<number>();
  const replacements: Array<{ start: number, end: number, replacement: string }> = [];

  let searchFrom = 0;
  while (true) {
    const titleIndex = svgContent.indexOf('<title>Tafel.', searchFrom);
    if (titleIndex === -1) {
      break;
    }

    const bounds = findGroupBounds(svgContent, titleIndex);
    if (!bounds) {
      warnings.push('Skipped a Tafel title without a matching group');
      searchFrom = titleIndex + 1;
      continue;
    }

    const groupMarkup = svgContent.slice(bounds.start, bounds.end);
    const tableNumber = extractTableNumber(groupMarkup);
    if (tableNumber == null) {
      warnings.push('Skipped a Tafel shape without a readable table number');
      searchFrom = bounds.end;
      continue;
    }

    if (seen.has(tableNumber)) {
      warnings.push(`Duplicate table number ${tableNumber} detected`);
      searchFrom = bounds.end;
      continue;
    }

    seen.add(tableNumber);
    tableNumbers.push(tableNumber);
    replacements.push({
      start: bounds.start,
      end: bounds.end,
      replacement: replaceGroupId(groupMarkup, tableNumber),
    });
    searchFrom = bounds.end;
  }

  let processed = svgContent;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    processed = `${processed.slice(0, replacement.start)}${replacement.replacement}${processed.slice(replacement.end)}`;
  }

  processed = injectBlinkCss(processed);

  tableNumbers.sort((left, right) => left - right);

  return {
    processedSvg: processed,
    tableNumbers,
    warnings,
  };
}
