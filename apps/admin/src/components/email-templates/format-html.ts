export interface HtmlLintWarning {
  message: string;
  line?: number;
}

export interface PrepareHtmlResult {
  formatted: string;
  warnings: HtmlLintWarning[];
}

const HANDLEBARS_TOKEN = /\{\{[\s\S]*?\}\}/g;
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

interface MaskResult {
  masked: string;
  tokens: string[];
}

export function maskHandlebars(html: string): MaskResult {
  const tokens: string[] = [];
  const masked = html.replace(HANDLEBARS_TOKEN, (match) => {
    const token = `__HB${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { masked, tokens };
}

export function unmaskHandlebars(masked: string, tokens: string[]): string {
  return masked.replace(/__HB(\d+)__/g, (_match, index) => tokens[Number(index)] ?? '');
}

export function prettyPrintHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return '';
  }

  const { masked, tokens } = maskHandlebars(trimmed);
  const formatted = formatMaskedHtml(masked);
  return unmaskHandlebars(formatted, tokens);
}

function formatMaskedHtml(input: string): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  const pattern = /(<\/?[^>]+>|__HB\d+__)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const text = normalized.slice(lastIndex, match.index).trim();
      if (text) {
        chunks.push(text);
      }
    }
    chunks.push(match[0]);
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < normalized.length) {
    const text = normalized.slice(lastIndex).trim();
    if (text) {
      chunks.push(text);
    }
  }

  let depth = 0;
  const output: string[] = [];

  for (const chunk of chunks) {
    const closingMatch = chunk.match(/^<\/([a-zA-Z0-9-]+)/);
    if (closingMatch) {
      depth = Math.max(0, depth - 1);
    }

    if (chunk.startsWith('<')) {
      output.push(`${'  '.repeat(depth)}${chunk}`);
    } else {
      output.push(`${'  '.repeat(depth)}${chunk}`);
    }

    const openingMatch = chunk.match(/^<([a-zA-Z0-9-]+)(?:\s|>|\/)/);
    const selfClosing = chunk.endsWith('/>')
      || (openingMatch && VOID_ELEMENTS.has(openingMatch[1].toLowerCase()));
    if (openingMatch && !closingMatch && !selfClosing) {
      depth += 1;
    }
  }

  return output.join('\n');
}

export function lintHtml(html: string): HtmlLintWarning[] {
  const warnings: HtmlLintWarning[] = [];
  const { masked, tokens } = maskHandlebars(html);
  const unmaskedForDisplay = unmaskHandlebars(masked, tokens);
  const lines = unmaskedForDisplay.split('\n');

  const tagPattern = /<\/?([a-zA-Z0-9-]+)[^>]*\/?>/g;
  const stack: Array<{ tag: string; line: number }> = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let match: RegExpExecArray | null;

    while ((match = tagPattern.exec(line)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();

      if (fullTag.startsWith('</')) {
        const last = stack.pop();
        if (!last) {
          warnings.push({ message: `Unexpected closing tag </${tagName}>`, line: lineNumber });
        } else if (last.tag !== tagName) {
          warnings.push({
            message: `Mismatched tag: expected </${last.tag}>, found </${tagName}>`,
            line: lineNumber,
          });
        }
        continue;
      }

      if (fullTag.endsWith('/>') || VOID_ELEMENTS.has(tagName)) {
        continue;
      }

      stack.push({ tag: tagName, line: lineNumber });
    }

    if (/<(?![a-zA-Z!/])/.test(line)) {
      warnings.push({ message: 'Stray "<" character in HTML', line: lineNumber });
    }

    if (/\shref\s*=\s*(['"])\s*\1/.test(line)) {
      warnings.push({ message: 'Empty href attribute', line: lineNumber });
    }
  });

  stack.forEach(({ tag, line }) => {
    warnings.push({ message: `Unclosed <${tag}> tag`, line });
  });

  return warnings;
}

export function prepareHtmlForSubmit(html: string): PrepareHtmlResult {
  const formatted = prettyPrintHtml(html);
  const warnings = lintHtml(formatted);
  return { formatted, warnings };
}

export function serializeHtmlEditor(value: string): string {
  return value.replace(/\r\n/g, '\n');
}
