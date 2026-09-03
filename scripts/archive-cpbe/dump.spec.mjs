import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { dumpGallery } from './dump.mjs';

const FIXTURE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * @param {string} url
 * @param {Map<string, { status: number, body: Buffer | object | string }>} routes
 */
function mockFetch(routes) {
  return async (url) => {
    const key = String(url).split('?')[0];
    const route = routes.get(key);
    if (!route) {
      return {
        ok: false,
        status: 404,
        arrayBuffer: async () => new ArrayBuffer(0),
        text: async () => '',
        json: async () => ({}),
      };
    }
    const { body, status } = route;
    return {
      ok: status >= 200 && status < 300,
      status,
      async arrayBuffer() {
        if (Buffer.isBuffer(body)) {
          return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength);
        }
        return new TextEncoder().encode(typeof body === 'string' ? body : JSON.stringify(body)).buffer;
      },
      async text() {
        if (typeof body === 'string') {
          return body;
        }
        if (Buffer.isBuffer(body)) {
          return body.toString('utf8');
        }
        return JSON.stringify(body);
      },
      async json() {
        return typeof body === 'object' && !Buffer.isBuffer(body) ? body : JSON.parse(await this.text());
      },
    };
  };
}

test('dumpGallery writes local JSON and downloads images', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cpbe-dump-'));
  const appDir = path.join(root, 'apps', 'cdj-web-int');

  const routes = new Map([
    ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css', { status: 200, body: 'css' }],
    ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js', { status: 200, body: 'js' }],
    ['https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js', { status: 200, body: 'purify' }],
    ['https://backend.coolestprojects.be/website/planning/0/projects.json', { status: 200, body: [] }],
    ['https://backend.coolestprojects.be/website/planning/6/projects.json', {
      status: 200,
      body: [{
        projectID: 99,
        projectName: 'Fixture',
        pic: 'https://coolestprojects.blob.core.windows.net/coolestproject26/fixture.png?sig=x',
      }],
    }],
    ['https://coolestprojects.blob.core.windows.net/coolestproject26/fixture.png', { status: 200, body: FIXTURE_PNG }],
    ['https://coderdojobelgium.be/cpbe/projects26.html', {
      status: 200,
      body: `<!DOCTYPE html><html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet"></head><body><img src="./images/coolestprojects%20website%202026.png"><script src="./projects26.js"></script></body></html>`,
    }],
    ['https://coderdojobelgium.be/cpbe/projects26.js', {
      status: 200,
      body: `<img class="card-img" src="\${card.pic}" alt="/">\nfetch('https://backend.coolestprojects.be/website/planning/6/projects.json')`,
    }],
    ['https://coderdojobelgium.be/cpbe/images/coolestprojects%20website%202026.png', { status: 200, body: FIXTURE_PNG }],
  ]);

  const kept = await dumpGallery({
    repoRoot: root,
    fetchImpl: mockFetch(routes),
    planningIds: [0, 6],
  });

  assert.deepEqual(kept, [6]);
  const json = JSON.parse(fs.readFileSync(path.join(appDir, 'data', '6', 'projects.json'), 'utf8'));
  assert.equal(json[0].pic, './images/6/fixture.png');
  assert.equal(fs.existsSync(path.join(appDir, 'images', '6', 'fixture.png')), true);
  const js = fs.readFileSync(path.join(appDir, 'projects26.js'), 'utf8');
  assert.match(js, /\.\/data\/6\/projects\.json/);
  assert.match(js, /cpbeMediaTag/);
  fs.rmSync(root, { recursive: true, force: true });
});
