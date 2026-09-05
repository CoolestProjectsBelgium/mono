import puppeteer from 'puppeteer';

const url = process.argv[2] ?? 'https://eventguide.coolestprojects.localhost:8443/map';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
});
const page = await browser.newPage();
page.setDefaultTimeout(60000);

const consoleLogs = [];
const failedRequests = [];
const floorplanRequests = [];
page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => consoleLogs.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => {
  failedRequests.push(`${req.url()} :: ${req.failure()?.errorText ?? 'unknown'}`);
});
page.on('response', async (res) => {
  const url = res.url();
  if (url.includes('floorplan') || url.includes('.svg')) {
    floorplanRequests.push({
      url,
      status: res.status(),
      ok: res.ok(),
    });
  }
});

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((resolve) => setTimeout(resolve, 8000));

const apiEvent = await page.evaluate(async () => {
  const response = await fetch('/eventguide/projects');
  const data = await response.json();
  return data.event;
});

const state = await page.evaluate(() => {
  const mapEl = document.querySelector('[data-testid="project-map"]');
  const loading = document.querySelector('[data-testid="map-loading"]');
  const error = document.querySelector('[data-testid="map-load-error"]');
  const empty = document.querySelector('[data-testid="map-empty"]');
  const leaflet = document.querySelector('.leaflet-container');
  const tiles = document.querySelectorAll('.leaflet-image-layer');
  const polygons = document.querySelectorAll('.leaflet-interactive');
  const mapRect = mapEl?.getBoundingClientRect();
  const leafletRect = leaflet?.getBoundingClientRect();
  const img = document.querySelector('.leaflet-image-layer img');
  const overlay = document.querySelector('.leaflet-image-layer');
  const imageRect = (img ?? overlay)?.getBoundingClientRect();
  const polygonRects = [...polygons].slice(0, 8).map((el) => {
    const rect = el.getBoundingClientRect();
    const overlap = imageRect
      ? Math.max(0, Math.min(rect.right, imageRect.right) - Math.max(rect.left, imageRect.left))
        * Math.max(0, Math.min(rect.bottom, imageRect.bottom) - Math.max(rect.top, imageRect.top))
      : 0;
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      overlapsImage: overlap > 0,
    };
  });
  return {
    mapExists: Boolean(mapEl),
    mapWidth: mapRect?.width ?? 0,
    mapHeight: mapRect?.height ?? 0,
    loadingVisible: Boolean(loading),
    loadingText: loading?.textContent?.trim() ?? null,
    errorText: error?.textContent?.trim() ?? null,
    emptyText: empty?.textContent?.trim() ?? null,
    leafletExists: Boolean(leaflet),
    leafletWidth: leafletRect?.width ?? 0,
    leafletHeight: leafletRect?.height ?? 0,
    imageLayerCount: tiles.length,
    imageSrc: img?.src ?? overlay?.querySelector('img')?.src ?? null,
    imageUsesBlob: Boolean(img?.src?.startsWith('blob:') ?? overlay?.innerHTML?.includes('blob:')),
    imageRect: imageRect
      ? {
          left: Math.round(imageRect.left),
          top: Math.round(imageRect.top),
          width: Math.round(imageRect.width),
          height: Math.round(imageRect.height),
        }
      : null,
    polygonCount: polygons.length,
    polygonRects,
    title: document.title,
  };
});

const screenshotPath = process.argv[3] ?? 'c:/Users/Dylan/Desktop/git/cdj/mono/map-debug.png';
await page.screenshot({ path: screenshotPath, fullPage: true });

console.log(JSON.stringify({ url, apiEvent, state, screenshotPath, floorplanRequests, failedRequests, consoleLogs: consoleLogs.slice(-20) }, null, 2));
await browser.close();
