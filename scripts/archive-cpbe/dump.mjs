#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildIndexHtml,
  extensionFromBytes,
  picFilename,
  patchGalleryJs,
  planningIdToPageName,
  planningIdToYear,
  resolveMediaFilename,
  localBannerFilename,
  remoteBannerFilename,
  rewriteBannerUrl,
  rewriteFetchUrl,
  rewriteProjects,
  rewriteVendorUrls,
  rewriteXhrUrl,
  shouldKeepPlanning,
  stripSas,
} from './rewrite.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * @param {string} repoRoot
 */
export function cdjWebIntPaths(repoRoot) {
  const appDir = path.join(repoRoot, 'apps', 'cdj-web-int');
  return {
    appDir,
    bannersDir: path.join(appDir, 'banners'),
    dataDir: path.join(appDir, 'data'),
    imagesDir: path.join(appDir, 'images'),
    vendorDir: path.join(appDir, 'vendor'),
  };
}

const BACKEND = 'https://backend.coolestprojects.be/website/planning';
const CPBE_BASE = 'https://coderdojobelgium.be/cpbe';
const PLANNING_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const VENDOR_FILES = [
  {
    name: 'bootstrap.min.css',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css',
  },
  {
    name: 'bootstrap.bundle.min.js',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js',
  },
  {
    name: 'purify.min.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js',
  },
];

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  return response.text();
}

/**
 * @param {string} dest
 * @param {Buffer} body
 */
function writeFile(dest, body) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
}

/**
 * @param {ReturnType<typeof cdjWebIntPaths>} paths
 * @param {typeof fetch} fetchImpl
 */
export async function vendorAssets(paths, fetchImpl = fetch) {
  fs.mkdirSync(paths.vendorDir, { recursive: true });
  for (const file of VENDOR_FILES) {
    const dest = path.join(paths.vendorDir, file.name);
    const body = await fetchImpl(file.url);
    if (!body.ok) {
      throw new Error(`Vendor download failed: ${file.url}`);
    }
    writeFile(dest, Buffer.from(await body.arrayBuffer()));
    process.stdout.write(`vendor ${file.name}\n`);
  }
}

/**
 * @param {ReturnType<typeof cdjWebIntPaths>} paths
 * @param {number} planningId
 * @param {object[]} projects
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Map<number, string>>}
 */
export async function downloadProjectImages(paths, planningId, projects, fetchImpl = fetch) {
  const imageDir = path.join(paths.imagesDir, String(planningId));
  fs.rmSync(imageDir, { recursive: true, force: true });
  fs.mkdirSync(imageDir, { recursive: true });
  const saved = new Map();

  for (const project of projects) {
    if (!project.pic) {
      continue;
    }
    const response = await fetchImpl(project.pic);
    let buffer;
    if (!response.ok) {
      const fallback = stripSas(project.pic);
      const fallbackResponse = fallback !== project.pic ? await fetchImpl(fallback) : response;
      if (!fallbackResponse.ok) {
        process.stderr.write(`  warn: image ${planningId}/${picFilename(project.pic)} (${fallbackResponse.status}), skip\n`);
        continue;
      }
      buffer = Buffer.from(await fallbackResponse.arrayBuffer());
    } else {
      buffer = Buffer.from(await response.arrayBuffer());
    }

    const filename = resolveMediaFilename(project.pic, buffer);
    const dest = path.join(imageDir, filename);
    writeFile(dest, buffer);
    saved.set(project.projectID, filename);
    process.stdout.write(`  image ${planningId}/${filename}\n`);
  }

  return saved;
}

/**
 * @param {ReturnType<typeof cdjWebIntPaths>} paths
 * @param {number} planningId
 * @param {typeof fetch} fetchImpl
 */
export async function downloadBanner(paths, planningId, fetchImpl = fetch) {
  const year = planningIdToYear(planningId);
  const remoteName = remoteBannerFilename(year);
  const localName = localBannerFilename(year);
  const url = `${CPBE_BASE}/images/${encodeURIComponent(remoteName)}`;
  const dest = path.join(paths.bannersDir, localName);
  const legacyDest = path.join(paths.bannersDir, encodeURIComponent(remoteName));
  if (fs.existsSync(dest)) {
    if (legacyDest !== dest && fs.existsSync(legacyDest)) {
      fs.unlinkSync(legacyDest);
    }
    return;
  }
  if (fs.existsSync(legacyDest)) {
    fs.mkdirSync(paths.bannersDir, { recursive: true });
    fs.renameSync(legacyDest, dest);
    process.stdout.write(`banner ${localName} (renamed)\n`);
    return;
  }
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Banner download failed (${response.status}): ${url}`);
  }
  writeFile(dest, Buffer.from(await response.arrayBuffer()));
  process.stdout.write(`banner ${localName}\n`);
}

/**
 * @param {ReturnType<typeof cdjWebIntPaths>} paths
 * @param {number} planningId
 * @param {typeof fetch} fetchImpl
 */
export async function dumpPlanningYear(paths, planningId, fetchImpl = fetch) {
  const jsonUrl = `${BACKEND}/${planningId}/projects.json`;
  const response = await fetchImpl(jsonUrl);
  if (!response.ok) {
    throw new Error(`Planning ${planningId} fetch failed: ${response.status}`);
  }
  const projects = await response.json();
  if (!shouldKeepPlanning(projects)) {
    process.stdout.write(`planning/${planningId}: empty, skip\n`);
    return null;
  }

  process.stdout.write(`planning/${planningId}: ${projects.length} projects\n`);
  const downloaded = await downloadProjectImages(paths, planningId, projects, fetchImpl);
  const rewritten = rewriteProjects(projects, planningId, downloaded);
  const dataPath = path.join(paths.dataDir, String(planningId), 'projects.json');
  writeFile(dataPath, Buffer.from(`${JSON.stringify(rewritten)}\n`));

  const page = planningIdToPageName(planningId);
  const year = planningIdToYear(planningId);
  const htmlUrl = `${CPBE_BASE}/${page}.html`;
  let html = await fetchText(htmlUrl);
  html = rewriteVendorUrls(html);
  html = rewriteBannerUrl(html, year);
  html = rewriteXhrUrl(html, planningId);

  const jsUrl = `${CPBE_BASE}/${page}.js`;
  const jsResponse = await fetchImpl(jsUrl);
  if (jsResponse.ok) {
    let js = await jsResponse.text();
    js = rewriteFetchUrl(js, planningId);
    js = patchGalleryJs(js);
    writeFile(path.join(paths.appDir, `${page}.js`), Buffer.from(js));
    if (!html.includes(`./${page}.js`)) {
      html = html.replace(
        /<script src="\.\/projects\d+\.js"><\/script>/,
        `<script src="./${page}.js"></script>`,
      );
    }
  }

  writeFile(path.join(paths.appDir, `${page}.html`), Buffer.from(html));
  await downloadBanner(paths, planningId, fetchImpl);
  return planningId;
}

/**
 * @param {{ fetchImpl?: typeof fetch, planningIds?: number[], repoRoot?: string }} [options]
 */
export async function dumpGallery(options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const planningIds = options.planningIds ?? PLANNING_IDS;
  const paths = cdjWebIntPaths(options.repoRoot ?? DEFAULT_REPO_ROOT);

  fs.mkdirSync(paths.appDir, { recursive: true });
  await vendorAssets(paths, fetchImpl);

  const kept = [];
  for (const planningId of planningIds) {
    const id = await dumpPlanningYear(paths, planningId, fetchImpl);
    if (id != null) {
      kept.push(id);
    }
  }

  const indexHtml = buildIndexHtml(kept);
  writeFile(path.join(paths.appDir, 'index.html'), Buffer.from(indexHtml));
  process.stdout.write(`index.html (${kept.length} years)\n`);
  return kept;
}

const isDirect =
  process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirect) {
  dumpGallery().then(
    () => process.exit(0),
    (error) => {
      console.error(error.message || error);
      process.exit(1);
    },
  );
}
