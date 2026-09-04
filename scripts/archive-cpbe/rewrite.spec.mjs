import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildIndexHtml,
  extensionFromBytes,
  localPicPath,
  patchGalleryJs,
  picFilename,
  planningIdToPageName,
  localBannerFilename,
  planningIdToYear,
  resolveMediaFilename,
  rewriteBannerUrl,
  rewriteFetchUrl,
  rewriteProjects,
  rewriteVendorUrls,
  rewriteXhrUrl,
  shouldKeepPlanning,
  stripSas,
} from './rewrite.mjs';

test('planningIdToYear maps 1–6 to 21–26', () => {
  assert.equal(planningIdToYear(1), 21);
  assert.equal(planningIdToYear(6), 26);
  assert.equal(planningIdToPageName(6), 'projects26');
});

test('shouldKeepPlanning skips empty arrays', () => {
  assert.equal(shouldKeepPlanning([]), false);
  assert.equal(shouldKeepPlanning([{ projectID: 1 }]), true);
  assert.equal(shouldKeepPlanning(null), false);
});

test('stripSas removes query string from blob URL', () => {
  const url =
    'https://coolestprojects.blob.core.windows.net/coolestproject26/abc.png?sv=2021&sig=xyz';
  assert.equal(
    stripSas(url),
    'https://coolestprojects.blob.core.windows.net/coolestproject26/abc.png',
  );
  assert.equal(picFilename(url), 'abc.png');
  assert.equal(localPicPath(6, url), './images/6/abc.png');
});

test('rewriteProjects rewrites pic paths', () => {
  const saved = new Map([[1, 'x.jpg']]);
  const projects = rewriteProjects(
    [{ projectID: 1, pic: 'https://example.blob/core/x.jpg?sig=1' }],
    3,
    saved,
  );
  assert.equal(projects[0].pic, './images/3/x.jpg');
});

test('rewriteProjects drops pic when download failed', () => {
  const projects = rewriteProjects(
    [{ projectID: 1, pic: 'https://example.blob/core/x.jpg?sig=1' }],
    3,
    new Map(),
  );
  assert.equal(projects[0].pic, undefined);
});

test('resolveMediaFilename uses attachment name and detected extension', () => {
  const url =
    'https://blob.example/coolestproject22/uuid?rscd=attachment%3B%20filename%3D%22Filmpje.mov%22';
  const mp4Header = Buffer.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]);
  assert.equal(resolveMediaFilename(url, mp4Header), 'Filmpje.mov');
});

test('resolveMediaFilename appends extension to bare blob id', () => {
  const url = 'https://blob.example/container/08d00cb7-b79c-48d3-badb-0adc92d1be92';
  const jpgHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  assert.equal(
    resolveMediaFilename(url, jpgHeader),
    '08d00cb7-b79c-48d3-badb-0adc92d1be92.jpg',
  );
});

test('patchGalleryJs uses cpbeMediaTag helper', () => {
  const js = patchGalleryJs('<img class="card-img" src="${card.pic}" alt="/">');
  assert.match(js, /function cpbeMediaTag/);
  assert.match(js, /\$\{cpbeMediaTag\(card\.pic\)\}/);
  assert.doesNotMatch(js, /<img class="card-img" src="\$\{card\.pic\}"/);
});

test('rewriteFetchUrl points at local JSON', () => {
  const js = "const data = await fetch('https://backend.coolestprojects.be/website/planning/6/projects.json')";
  assert.match(rewriteFetchUrl(js, 6), /\.\/data\/6\/projects\.json/);
  assert.doesNotMatch(rewriteFetchUrl(js, 6), /backend\.coolestprojects/);
});

test('rewriteXhrUrl points inline pages at local JSON', () => {
  const html =
    'xhttp.open("GET", "https://backend.coolestprojects.be/website/planning/1/projects.json", true);';
  assert.match(rewriteXhrUrl(html, 1), /\.\/data\/1\/projects\.json/);
});

test('localBannerFilename is hyphenated and year-safe', () => {
  assert.equal(localBannerFilename(26), 'coolestprojects-website-2026.png');
  assert.equal(localBannerFilename(2025), 'coolestprojects-website-2025.png');
});

test('rewriteBannerUrl points at hyphenated local banner', () => {
  const html = '<img src="./images/coolestprojects%20website%202026.png">';
  assert.equal(
    rewriteBannerUrl(html, 26),
    '<img src="./banners/coolestprojects-website-2026.png">',
  );
});

test('rewriteVendorUrls replaces CDN links', () => {
  const html =
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">';
  assert.match(rewriteVendorUrls(html), /\.\/vendor\/bootstrap\.min\.css/);
});

test('buildIndexHtml lists only kept years', () => {
  const html = buildIndexHtml([1, 6]);
  assert.match(html, /projects21\.html/);
  assert.match(html, /projects26\.html/);
  assert.doesNotMatch(html, /projects22\.html/);
});
