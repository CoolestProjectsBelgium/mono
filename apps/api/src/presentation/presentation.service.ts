import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Attachment,
  Event,
  EventTable,
  PresentationRender,
  PresentationSlide,
  Project,
} from '@coolestprojects/database';
import * as Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { parseTableNumber } from '../eventguide/parse-table-number';
import {
  getPresentationAssetsDir,
  getPresentationDir,
  sanitizePresentationAssetFilename,
} from './presentation-path';

/** A visible project's raw, DB-only data — cheap to fetch, safe to hash directly (no file reads). */
interface ProjectRecord {
  id: number;
  name: string;
  description: string;
  language: string;
  tableName: string | null;
  tableNumber: number | null;
  attachmentFilePath: string | null;
}

type SlideData =
  | { kind: 'none' }
  | { kind: 'single'; records: ProjectRecord[] }
  | { kind: 'perRecord'; record: ProjectRecord };

interface SlideSpec {
  key: string;
  order: number;
  time: number;
  body: string;
  imagePath: string | null;
  data: SlideData;
}

export interface SlideSummary {
  key: string;
  order: number;
  time: number;
  hash: string;
  generatedAt: string | null;
}

export interface SlideListResult {
  slides: SlideSummary[];
  hash: string;
}

export interface SlideMeta {
  hash: string;
  generatedAt: Date | null;
}

export interface SlideImageResult {
  file: StreamableFile;
  hash: string;
  generatedAt: Date;
}

const SLIDE_VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 1 };

@Injectable()
export class PresentationService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(PresentationSlide)
    private readonly presentationSlideModel: typeof PresentationSlide,
    @InjectModel(PresentationRender)
    private readonly presentationRenderModel: typeof PresentationRender,
  ) {}

  async listSlides(eventId: number): Promise<SlideListResult> {
    const { specs, assetsFingerprint } = await this.loadDeckContext(eventId);
    const renders = await this.presentationRenderModel.findAll({
      where: { eventId, slideKey: specs.map((spec) => spec.key) },
    });
    const renderByKey = new Map(
      renders.map((render) => [render.slideKey, render]),
    );

    const slides: SlideSummary[] = specs.map((spec) => {
      const hash = this.hashSlide(spec, assetsFingerprint);
      const render = renderByKey.get(spec.key);
      const upToDate = render && render.contentHash === hash;
      return {
        key: spec.key,
        order: spec.order,
        time: spec.time,
        hash,
        generatedAt: upToDate ? render.generatedAt.toISOString() : null,
      };
    });

    const rollup = createHash('sha256')
      .update(slides.map((slide) => `${slide.key}:${slide.hash}`).join('|'))
      .digest('hex');

    return { slides, hash: rollup };
  }

  /** Hash/last-generated lookup only — never renders. Backs the `HEAD` route. */
  async getSlideMeta(eventId: number, key: string): Promise<SlideMeta> {
    const { specs, assetsFingerprint } = await this.loadDeckContext(eventId);
    const spec = this.findSpec(specs, key);
    const hash = this.hashSlide(spec, assetsFingerprint);

    const render = await this.presentationRenderModel.findOne({
      where: { eventId, slideKey: key },
    });
    const upToDate = render && render.contentHash === hash;

    return { hash, generatedAt: upToDate ? render.generatedAt : null };
  }

  async getSlideImage(eventId: number, key: string): Promise<SlideImageResult> {
    const { common, specs, assetsFingerprint } =
      await this.loadDeckContext(eventId);
    const spec = this.findSpec(specs, key);
    const hash = this.hashSlide(spec, assetsFingerprint);

    let render = await this.presentationRenderModel.findOne({
      where: { eventId, slideKey: key },
    });

    if (!render || render.contentHash !== hash) {
      const imagePath = await this.renderSlide(eventId, common, spec);
      const generatedAt = new Date();
      if (render) {
        await render.update({ contentHash: hash, imagePath, generatedAt });
      } else {
        render = await this.presentationRenderModel.create({
          eventId,
          slideKey: key,
          contentHash: hash,
          imagePath,
          generatedAt,
        });
      }
    }

    const fullPath = path.join(getPresentationDir(eventId), render.imagePath);
    const buffer = await readFile(fullPath);

    return {
      file: new StreamableFile(buffer, { type: 'image/png' }),
      hash: render.contentHash,
      generatedAt: render.generatedAt,
    };
  }

  private findSpec(specs: SlideSpec[], key: string): SlideSpec {
    const spec = specs.find((candidate) => candidate.key === key);
    if (!spec) {
      throw new NotFoundException('Slide not found');
    }
    return spec;
  }

  private hashSlide(spec: SlideSpec, assetsFingerprint: string): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          body: spec.body,
          imagePath: spec.imagePath,
          data: spec.data,
          assetsFingerprint,
        }),
      )
      .digest('hex');
  }

  /**
   * Renders a slide with a caller-supplied `body` instead of the saved one —
   * for the admin quick-edit preview. Uses the slide's real, saved
   * `dataSource`/`cardinality`/`imagePath` and real project data, but never
   * writes to `PresentationRender` or disk: this is a throwaway render, not
   * part of the delta-sync cache the Pi devices rely on.
   */
  async previewSlideDraft(
    eventId: number,
    input: { slideId: number; body: string; projectId?: number },
  ): Promise<Buffer> {
    const config = await this.presentationSlideModel.findOne({
      where: { id: input.slideId, eventId },
    });
    if (!config) {
      throw new NotFoundException('Slide not found');
    }

    const event = await this.loadEvent(eventId);
    const common = {
      ...this.buildCommonContext(event),
      assets: await this.loadAssetsContext(eventId),
    };

    let data: SlideData = { kind: 'none' };
    if (config.dataSource === 'projects') {
      const records = await this.loadVisibleProjects(eventId);
      if (config.cardinality === 'perRecord') {
        const record = input.projectId
          ? records.find((candidate) => candidate.id === input.projectId)
          : records[0];
        if (!record) {
          throw new NotFoundException(
            'No visible project available to preview with',
          );
        }
        data = { kind: 'perRecord', record };
      } else {
        data = { kind: 'single', records };
      }
    }

    const templateContext = await this.buildTemplateContext(common, data);
    const backgroundDataUri = config.imagePath
      ? await this.toDataUri(
          path.join(getPresentationDir(eventId), config.imagePath),
        )
      : null;

    const html = this.compileSlideHtml(
      input.body,
      backgroundDataUri,
      templateContext,
    );
    return this.screenshotHtml(html);
  }

  /** Visible-project options for the admin's perRecord preview picker. */
  async listVisibleProjectOptions(
    eventId: number,
  ): Promise<{ id: number; name: string }[]> {
    const records = await this.loadVisibleProjects(eventId);
    return records.map((record) => ({ id: record.id, name: record.name }));
  }

  private async loadEvent(eventId: number): Promise<Event> {
    const event = await this.eventModel.findByPk(eventId, {
      attributes: [
        'id',
        'eventTitle',
        'eventBeginDate',
        'eventEndDate',
        'registrationOpenDate',
        'registrationClosedDate',
        'projectClosedDate',
        'officialStartDate',
        'floorplanPath',
      ],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  /**
   * Loads the event, its slide configs, and (if any config needs it) the
   * visible-projects data source once — pure DB reads, no rendering, no
   * file I/O, so this stays cheap enough to run on every list/meta/image
   * request without penalizing a Pi that's just checking for changes.
   */
  private async loadDeckContext(eventId: number): Promise<{
    event: Event;
    common: Record<string, unknown>;
    specs: SlideSpec[];
    assetsFingerprint: string;
  }> {
    const event = await this.loadEvent(eventId);
    const common = this.buildCommonContext(event);
    const assetsFingerprint = await this.loadAssetsFingerprint(eventId);
    const configs = await this.presentationSlideModel.findAll({
      where: { eventId },
      order: [
        ['order', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    let projectRecords: ProjectRecord[] | null = null;
    const loadProjects = async (): Promise<ProjectRecord[]> => {
      if (!projectRecords) {
        projectRecords = await this.loadVisibleProjects(eventId);
      }
      return projectRecords;
    };

    const specs: SlideSpec[] = [];
    for (const config of configs) {
      if (config.dataSource === 'projects') {
        const records = await loadProjects();

        if (config.cardinality === 'perRecord') {
          for (const record of records) {
            specs.push({
              key: `slide-${config.id}-${record.id}`,
              order: config.order,
              time: config.time,
              body: config.body,
              imagePath: config.imagePath,
              data: { kind: 'perRecord', record },
            });
          }
        } else {
          specs.push({
            key: `slide-${config.id}`,
            order: config.order,
            time: config.time,
            body: config.body,
            imagePath: config.imagePath,
            data: { kind: 'single', records },
          });
        }
      } else {
        specs.push({
          key: `slide-${config.id}`,
          order: config.order,
          time: config.time,
          body: config.body,
          imagePath: config.imagePath,
          data: { kind: 'none' },
        });
      }
    }

    return { event, common, specs, assetsFingerprint };
  }

  /**
   * Visible-projects data source: only projects with a table assignment are
   * shown (no `EventTable` row → hidden from the deck entirely — `required:
   * true` is the visibility filter, deliberately the opposite of the event
   * guide's `required: false`). Image is just the first confirmed
   * attachment, no photo-consent gate (that's an event-guide-only rule).
   */
  private async loadVisibleProjects(eventId: number): Promise<ProjectRecord[]> {
    const projects = await this.projectModel.findAll({
      where: { eventId, deletedAt: null },
      include: [
        { model: EventTable, required: true },
        { model: Attachment, where: { confirmed: true }, required: false },
      ],
    });

    const records: ProjectRecord[] = projects.map((project) => {
      const tableName = project.table?.name ?? null;
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        language: project.language,
        tableName,
        tableNumber: parseTableNumber(tableName),
        attachmentFilePath: project.attachments?.[0]?.filepath ?? null,
      };
    });

    records.sort((left, right) => {
      const leftTable = left.tableNumber ?? Number.MAX_SAFE_INTEGER;
      const rightTable = right.tableNumber ?? Number.MAX_SAFE_INTEGER;
      if (leftTable !== rightTable) {
        return leftTable - rightTable;
      }
      return left.name.localeCompare(right.name);
    });

    return records;
  }

  private buildCommonContext(event: Event): Record<string, unknown> {
    return {
      year: new Date(event.officialStartDate).getFullYear(),
      website: process.env.WEBSITE_URL || 'https://coolestprojects.be',
      event: {
        eventTitle: event.eventTitle,
        eventBeginDate: event.eventBeginDate,
        eventEndDate: event.eventEndDate,
        registrationOpenDate: event.registrationOpenDate,
        registrationClosedDate: event.registrationClosedDate,
        projectClosedDate: event.projectClosedDate,
        officialStartDate: event.officialStartDate,
        floorplanPath: event.floorplanPath,
      },
    };
  }

  /** Only reached on a cache miss/stale hash — everything above this point is pure DB reads. */
  private async renderSlide(
    eventId: number,
    common: Record<string, unknown>,
    spec: SlideSpec,
  ): Promise<string> {
    const assets = await this.loadAssetsContext(eventId);
    const templateContext = await this.buildTemplateContext(
      { ...common, assets },
      spec.data,
    );
    const backgroundDataUri = spec.imagePath
      ? await this.toDataUri(
          path.join(getPresentationDir(eventId), spec.imagePath),
        )
      : null;

    const html = this.compileSlideHtml(
      spec.body,
      backgroundDataUri,
      templateContext,
    );
    const png = await this.screenshotHtml(html);

    const dir = getPresentationDir(eventId);
    await mkdir(dir, { recursive: true });
    const filename = `${spec.key}.png`;
    await writeFile(path.join(dir, filename), png);
    return filename;
  }

  private async buildTemplateContext(
    common: Record<string, unknown>,
    data: SlideData,
  ): Promise<Record<string, unknown>> {
    if (data.kind === 'perRecord') {
      return {
        ...common,
        record: await this.projectRecordForTemplate(data.record),
      };
    }
    if (data.kind === 'single') {
      const records = await Promise.all(
        data.records.map((record) => this.projectRecordForTemplate(record)),
      );
      return { ...common, records };
    }
    return { ...common };
  }

  private async projectRecordForTemplate(
    record: ProjectRecord,
  ): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      language: record.language,
      tableName: record.tableName,
      tableNumber: record.tableNumber,
      thumbnailDataUri: record.attachmentFilePath
        ? await this.toDataUri(record.attachmentFilePath)
        : null,
    };
  }

  /**
   * Cheap stand-in for the assets folder's content on the hot list/meta poll
   * path: a hash of filenames + mtimes + sizes, not file contents, so a Pi
   * checking for changes doesn't pay for reading/base64-encoding every logo
   * on every poll. Only actually reached-for-render code
   * (`renderSlide`/`previewSlideDraft`, both cache-miss-only) loads the real
   * data URIs via `loadAssetsContext`.
   */
  private async loadAssetsFingerprint(eventId: number): Promise<string> {
    let entries;
    try {
      entries = await readdir(getPresentationAssetsDir(eventId), {
        withFileTypes: true,
      });
    } catch {
      return 'none';
    }

    const stats = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() && sanitizePresentationAssetFilename(entry.name),
        )
        .map(async (entry) => {
          const fileStat = await stat(
            path.join(getPresentationAssetsDir(eventId), entry.name),
          );
          return `${entry.name}:${fileStat.mtimeMs}:${fileStat.size}`;
        }),
    );
    stats.sort();

    return createHash('sha256').update(stats.join('|')).digest('hex');
  }

  /**
   * Logos/art uploaded for the event (see `AdminService.listPresentationAssets`),
   * keyed by filename and pre-inlined as data URIs so a slide's Handlebars `body`
   * can reference one directly, e.g. `<img src="{{lookup assets 'logo.png'}}">`.
   * Only called on an actual render (cache miss or preview) — never on the
   * hot list/meta poll path, see `loadAssetsFingerprint`.
   */
  private async loadAssetsContext(
    eventId: number,
  ): Promise<Record<string, string>> {
    let entries;
    try {
      entries = await readdir(getPresentationAssetsDir(eventId), {
        withFileTypes: true,
      });
    } catch {
      return {};
    }

    const assets: Record<string, string> = {};
    for (const entry of entries) {
      if (!entry.isFile() || !sanitizePresentationAssetFilename(entry.name)) {
        continue;
      }
      const dataUri = await this.toDataUri(
        path.join(getPresentationAssetsDir(eventId), entry.name),
      );
      if (dataUri) {
        assets[entry.name] = dataUri;
      }
    }
    return assets;
  }

  /** Inlines a file as a data URI so Puppeteer never needs network/filesystem access from the page itself. */
  private async toDataUri(filePath: string): Promise<string | null> {
    try {
      const buffer = await readFile(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mime =
        ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext || 'png';
      return `data:image/${mime};base64,${buffer.toString('base64')}`;
    } catch {
      return null;
    }
  }

  private compileSlideHtml(
    body: string,
    backgroundDataUri: string | null,
    context: Record<string, unknown>,
  ): string {
    const template = Handlebars.compile(body, { noEscape: true });
    const contentHtml = template(context);
    const backgroundStyle = backgroundDataUri
      ? `background-image: url('${backgroundDataUri}'); background-size: cover; background-position: center;`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    width: ${SLIDE_VIEWPORT.width}px;
    height: ${SLIDE_VIEWPORT.height}px;
    font-family: Arial, sans-serif;
    ${backgroundStyle}
  }
</style>
</head>
<body>${contentHtml}</body>
</html>`;
  }

  private async screenshotHtml(html: string): Promise<Buffer> {
    // Containers (dev and deploy) run this as root with no user-namespace sandboxing
    // available, which Chrome's zygote refuses to start under unless sandboxing is
    // disabled explicitly (see https://crbug.com/638180).
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport(SLIDE_VIEWPORT);
      await page.setContent(html);
      const image = await page.screenshot({ type: 'png' });
      return Buffer.from(image);
    } finally {
      await browser.close();
    }
  }
}
