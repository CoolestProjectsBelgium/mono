#!/usr/bin/env node
/**
 * Validates repo documentation index: required files, section headings,
 * deep-page sections, relative markdown links, and Cursor rule frontmatter.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WORKSPACES = {
  apps: ['admin', 'api', 'eventguide', 'presentation', 'registration', 'voting'],
  packages: ['database'],
};

const STUB_SECTIONS = [
  'Purpose',
  'Stack',
  'Entrypoints',
  'Talks to',
  'Out of scope / unknowns',
  'Status',
];

const DEEP_PAGES = {
  'docs/apps/api.md': ['Module map', 'Key flows'],
  'docs/packages/database.md': ['Model map', 'Key flows'],
};

const REQUIRED_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'docs/README.md',
  'docs/architecture.md',
  'docs/local-setup.md',
  ...WORKSPACES.apps.map((name) => `docs/apps/${name}.md`),
  ...WORKSPACES.packages.map((name) => `docs/packages/${name}.md`),
  '.cursor/rules/repo-docs.mdc',
  '.cursor/rules/api-nestjs.mdc',
  '.cursor/rules/database-sequelize.mdc',
  '.cursor/rules/admin-adminjs.mdc',
  '.cursor/rules/voting-nuxt.mdc',
];

const LINK_CHECK_ROOTS = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'docs/README.md',
  'docs/architecture.md',
  'docs/local-setup.md',
  ...WORKSPACES.apps.map((name) => `docs/apps/${name}.md`),
  ...WORKSPACES.packages.map((name) => `docs/packages/${name}.md`),
  ...WORKSPACES.apps.map((name) => `apps/${name}/README.md`),
  'packages/database/README.md',
];

const README_POINTER = /docs\/(apps|packages)\//;

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function hasHeading(content, heading) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'm');
  return pattern.test(content);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkRequiredFiles() {
  for (const file of REQUIRED_FILES) {
    if (!exists(file)) {
      fail(`Missing required file: ${file}`);
    }
  }
}

function checkStubSections(filePath) {
  if (!exists(filePath)) return;
  const content = read(filePath);
  for (const section of STUB_SECTIONS) {
    if (!hasHeading(content, section)) {
      fail(`${filePath}: missing heading "## ${section}"`);
    }
  }
  if (!/^Status:\s*(stub|deep)\s*$/m.test(content)) {
    fail(`${filePath}: missing "Status: stub" or "Status: deep" line`);
  }
}

function checkDeepSections() {
  for (const [filePath, sections] of Object.entries(DEEP_PAGES)) {
    if (!exists(filePath)) continue;
    const content = read(filePath);
    if (!/^Status:\s*deep\s*$/m.test(content)) {
      fail(`${filePath}: deep page must have "Status: deep"`);
    }
    for (const section of sections) {
      if (!hasHeading(content, section)) {
        fail(`${filePath}: deep page missing heading "## ${section}"`);
      }
    }
  }
}

function resolveLink(fromFile, linkTarget) {
  const [filePart, anchor] = linkTarget.split('#');
  const baseDir = path.dirname(fromFile);
  const resolved = path.normalize(path.join(baseDir, filePart));
  if (!exists(resolved)) {
    return { ok: false, resolved };
  }
  if (anchor) {
    const content = read(resolved);
    const slug = anchor.toLowerCase();
    const headingPattern = new RegExp(
      `^#+\\s+.*${escapeRegExp(anchor.replace(/-/g, ' '))}`,
      'im',
    );
    const hasAnchor =
      content.toLowerCase().includes(slug) || headingPattern.test(content);
    if (!hasAnchor && !content.includes(`id="${anchor}"`)) {
      return { ok: false, resolved, anchor };
    }
  }
  return { ok: true, resolved };
}

function checkMarkdownLinks(filePath) {
  if (!exists(filePath)) return;
  const content = read(filePath);
  const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const target = match[2].trim();
    if (
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:')
    ) {
      continue;
    }
    if (target.startsWith('#')) continue;
    const result = resolveLink(filePath, target);
    if (!result.ok) {
      const detail = result.anchor
        ? `${result.resolved}#${result.anchor}`
        : result.resolved;
      fail(`${filePath}: broken link "${target}" → ${detail}`);
    }
  }
}

function checkReadmePointers() {
  for (const app of WORKSPACES.apps) {
    const readme = `apps/${app}/README.md`;
    if (!exists(readme)) {
      fail(`Missing README: ${readme}`);
      continue;
    }
    const content = read(readme);
    if (!README_POINTER.test(content)) {
      fail(`${readme}: must link to a docs/apps/ or docs/packages/ page`);
    }
  }
  const dbReadme = 'packages/database/README.md';
  if (!exists(dbReadme)) {
    fail(`Missing README: ${dbReadme}`);
  } else if (!README_POINTER.test(read(dbReadme))) {
    fail(`${dbReadme}: must link to a docs/apps/ or docs/packages/ page`);
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  }
  return data;
}

function checkCursorRules() {
  const rules = {
    '.cursor/rules/repo-docs.mdc': { alwaysApply: 'true' },
    '.cursor/rules/api-nestjs.mdc': { globs: 'apps/api/**' },
    '.cursor/rules/database-sequelize.mdc': { globs: 'packages/database/**' },
    '.cursor/rules/admin-adminjs.mdc': { globs: 'apps/admin/**' },
    '.cursor/rules/voting-nuxt.mdc': { globs: 'apps/voting/**' },
  };
  for (const [file, expected] of Object.entries(rules)) {
    if (!exists(file)) continue;
    const fm = parseFrontmatter(read(file));
    if (!fm) {
      fail(`${file}: missing YAML frontmatter`);
      continue;
    }
    for (const [key, value] of Object.entries(expected)) {
      if (fm[key] !== value) {
        fail(`${file}: expected frontmatter ${key}: ${value}, got ${fm[key] ?? '(missing)'}`);
      }
    }
  }
}

function main() {
  checkRequiredFiles();

  for (const app of WORKSPACES.apps) {
    checkStubSections(`docs/apps/${app}.md`);
  }
  for (const pkg of WORKSPACES.packages) {
    checkStubSections(`docs/packages/${pkg}.md`);
  }

  checkDeepSections();
  checkReadmePointers();

  for (const file of LINK_CHECK_ROOTS) {
    checkMarkdownLinks(file);
  }

  checkCursorRules();

  if (errors.length > 0) {
    console.error('Documentation check failed:\n');
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log('Documentation check passed.');
}

main();
