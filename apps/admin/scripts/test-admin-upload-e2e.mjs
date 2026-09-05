import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminBase = process.env.ADMIN_BASE ?? 'http://127.0.0.1:3000/admin';
const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const sourcePath = path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg');
const targetPath = process.env.FLOORPLAN_PATH ?? '/tmp/uploads/floorplans/grondplan-cp-2026-zaal.svg';
const cookieJar = new Map();

function storeCookies(response) {
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) {
    const [pair] = cookie.split(';');
    const [name, value] = pair.split('=');
    cookieJar.set(name.trim(), value.trim());
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function adminFetch(url, options = {}) {
  const headers = {
    ...(options.headers ?? {}),
    ...(cookieJar.size ? { Cookie: cookieHeader() } : {}),
  };
  const response = await fetch(url, { ...options, headers, redirect: 'manual' });
  storeCookies(response);
  return response;
}

async function login() {
  const response = await adminFetch(`${adminBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: 'admin',
      password: 'admin',
      event: '1',
    }),
  });
  if (response.status !== 302 && response.status !== 200) {
    const text = await response.text();
    throw new Error(`Admin login failed (${response.status}): ${text.slice(0, 300)}`);
  }
}

async function uploadFloorplan() {
  const svgContent = readFileSync(sourcePath, 'utf8');
  const response = await adminFetch(`${adminBase}/api/pages/Floorplans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'upload',
      originalName: 'Grondplan CP 2026_Zaal.svg',
      svgContent,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${text.slice(0, 500)}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return data;
}

async function checkSavedFile() {
  const { isProcessedSvgCorrupt } = await import('../src/components/floorplans/process-visio-svg.ts');
  const svg = readFileSync(targetPath, 'utf8');
  return {
    size: svg.length,
    corrupt: isProcessedSvgCorrupt(svg),
    corruptAttr: /[xy]="-?\d+\.?\d*<g id="table_/i.test(svg),
    corruptText: /<text[^>]*<g id="table_/i.test(svg),
    tables: (svg.match(/id="table_/g) ?? []).length,
  };
}

async function checkMapApi() {
  const projects = await fetch('http://127.0.0.1:3001/eventguide/projects').then((r) => r.json());
  const floorplanPath = projects.event.floorplanPath;
  const version = projects.event.floorplanVersion ?? '';
  const floorplanUrl = `http://127.0.0.1:3001/${floorplanPath.replace(/^\//, '')}${version ? `?v=${encodeURIComponent(version)}` : ''}`;
  const floorplanResponse = await fetch(floorplanUrl);
  const floorplanText = await floorplanResponse.text();
  const { isProcessedSvgCorrupt } = await import('../src/components/floorplans/process-visio-svg.ts');
  return {
    floorplanPath,
    floorplanVersion: version,
    floorplanStatus: floorplanResponse.status,
    floorplanSize: floorplanText.length,
    floorplanCorrupt: isProcessedSvgCorrupt(floorplanText),
    projectCount: projects.projects.length,
  };
}

await login();
const uploadResult = await uploadFloorplan();
const saved = await checkSavedFile();
const mapApi = await checkMapApi();

const report = {
  uploadActive: uploadResult.activeFilename ?? null,
  saved,
  mapApi,
  pass: !saved.corrupt && !mapApi.floorplanCorrupt && mapApi.floorplanStatus === 200,
};

writeFileSync('/tmp/admin-upload-e2e.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.pass) {
  process.exitCode = 1;
}
