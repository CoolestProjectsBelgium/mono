import { readFileSync } from 'node:fs';

const projectsUrl = process.argv[2] ?? 'http://127.0.0.1:3001/eventguide/projects';
const mapUrl = process.argv[3] ?? 'http://127.0.0.1:3002/map';

const projects = await fetch(projectsUrl).then((r) => r.json());
const floorplanPath = projects.event.floorplanPath;
const floorplanUrl = floorplanPath.startsWith('http')
  ? floorplanPath
  : `http://127.0.0.1:3001/${floorplanPath.replace(/^\//, '')}`;

const floorplanResponse = await fetch(floorplanUrl);
const floorplanText = await floorplanResponse.text();
const mapHtml = await fetch(mapUrl).then((r) => r.text());

const viewBoxMatch = floorplanText.match(/viewBox=["']([^"']+)["']/i);
const widthMatch = floorplanText.match(/\bwidth=["']([0-9.]+)/i);
const heightMatch = floorplanText.match(/\bheight=["']([0-9.]+)/i);

console.log(JSON.stringify({
  floorplanPath,
  floorplanStatus: floorplanResponse.status,
  floorplanContentType: floorplanResponse.headers.get('content-type'),
  floorplanSize: floorplanText.length,
  corruptAttr: /[xy]="-?\d+\.?\d*<g id="table_/i.test(floorplanText),
  viewBox: viewBoxMatch?.[1] ?? null,
  width: widthMatch?.[1] ?? null,
  height: heightMatch?.[1] ?? null,
  mapStatus: 200,
  mapHasProjectMap: mapHtml.includes('data-testid="project-map"'),
  mapHasLoadError: mapHtml.includes('data-testid="map-load-error"'),
  mapHasLoading: mapHtml.includes('data-testid="map-loading"'),
  projectCount: projects.projects.length,
}, null, 2));
