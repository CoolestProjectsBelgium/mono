import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Event,
  PresentationSlide,
  Project,
  Registration,
  User,
  UserProject,
} from '@coolestprojects/database';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { FloorplansOverviewDto } from '../dto/floorplans-overview.dto';
import { MailTemplateContextRequestDto } from '../dto/mail-template-context.dto';
import { PresentationAssetsOverviewDto } from '../dto/presentation-assets.dto';
import { MulterFile } from '../file-upload/multer-file.type';
import {
  getFloorplanDir,
  resolveFloorplanFilePath,
  sanitizeFloorplanFilename,
} from '../eventguide/floorplan-path';
import {
  isProcessedSvgCorrupt,
  processVisioSvg,
} from '../eventguide/process-visio-svg';
import { buildMailContext, PREVIEW_TOKEN } from '../mailer/mail-context';
import {
  getPresentationAssetsDir,
  getPresentationDir,
  resolvePresentationAssetFilePath,
  sanitizePresentationAssetFilename,
} from '../presentation/presentation-path';
import {
  PresentationService,
  SlideImageResult,
  SlideListResult,
} from '../presentation/presentation.service';
import { PreviewPresentationSlideDraftDto } from '../dto/presentation-preview.dto';

function slugifyFilename(originalName: string): string {
  const base = path.basename(originalName, path.extname(originalName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'floorplan'}.svg`;
}

/**
 * Admin image uploads (slide backgrounds, presentation assets) end up as a
 * `data:` URI inlined into HTML that Puppeteer/Chromium renders — the
 * extension just needs to match what Chromium can decode, not feh (the
 * Pi only ever sees the resulting rendered PNG, never these source files).
 * Keyed by mimetype rather than trusting the client-supplied filename, so
 * the saved extension and actual content can never disagree.
 */
const BROWSER_IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/** Re-uploading the same original name overwrites its asset, same as `slugifyFilename` does for floor plans. */
function slugifyAssetFilename(originalName: string, ext: string): string {
  const base = path.basename(originalName, path.extname(originalName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'asset'}.${ext}`;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
    @InjectModel(PresentationSlide)
    private readonly presentationSlideModel: typeof PresentationSlide,
    private readonly presentationService: PresentationService,
  ) {}

  async listFloorplans(eventId: number): Promise<FloorplansOverviewDto> {
    const floorplanDir = getFloorplanDir();
    await mkdir(floorplanDir, { recursive: true });

    const event = await this.eventModel.findByPk(eventId, {
      attributes: ['floorplanPath'],
    });
    const activeFilename = event?.floorplanPath ?? null;

    const entries = await readdir(floorplanDir, { withFileTypes: true });
    const floorplans = await Promise.all(
      entries
        .filter(
          (entry) => entry.isFile() && sanitizeFloorplanFilename(entry.name),
        )
        .map(async (entry) => {
          const filePath = path.join(floorplanDir, entry.name);
          const fileStat = await stat(filePath);
          return {
            filename: entry.name,
            uploadedAt: fileStat.mtime.toISOString(),
            isActive: entry.name === activeFilename,
          };
        }),
    );

    floorplans.sort((left, right) =>
      right.uploadedAt.localeCompare(left.uploadedAt),
    );

    return {
      floorplans,
      activeFilename,
    };
  }

  async uploadFloorplan(
    eventId: number,
    file: MulterFile,
  ): Promise<FloorplansOverviewDto> {
    const svgContent = (file.buffer ?? Buffer.alloc(0)).toString('utf8');
    const originalName = file.originalname || 'floorplan.svg';

    if (!svgContent.trim().startsWith('<')) {
      throw new BadRequestException('Upload must be an SVG file');
    }
    if (isProcessedSvgCorrupt(svgContent)) {
      throw new BadRequestException(
        'This SVG looks corrupted. Upload the original Visio export, not a previously processed floor plan.',
      );
    }

    const processed = processVisioSvg(svgContent);
    if (processed.tableNumbers.length === 0) {
      throw new BadRequestException('No tables were detected in this SVG');
    }
    if (isProcessedSvgCorrupt(processed.processedSvg)) {
      throw new BadRequestException(
        'Floor plan processing failed: SVG structure was corrupted',
      );
    }

    const filename = slugifyFilename(originalName);
    const floorplanDir = getFloorplanDir();
    await mkdir(floorplanDir, { recursive: true });
    await writeFile(
      path.join(floorplanDir, filename),
      processed.processedSvg,
      'utf8',
    );
    await this.eventModel.update(
      { floorplanPath: filename },
      { where: { id: eventId } },
    );

    return this.listFloorplans(eventId);
  }

  async activateFloorplan(
    eventId: number,
    filename: string,
  ): Promise<FloorplansOverviewDto> {
    const safeFilename = sanitizeFloorplanFilename(filename);
    if (!safeFilename) {
      throw new BadRequestException('Invalid floor plan filename');
    }

    const filePath = resolveFloorplanFilePath(safeFilename);
    if (!filePath) {
      throw new NotFoundException('Floor plan file not found');
    }

    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('Floor plan file not found');
    }

    await this.eventModel.update(
      { floorplanPath: safeFilename },
      { where: { id: eventId } },
    );

    return this.listFloorplans(eventId);
  }

  /**
   * Static art for a `dataSource: 'none'` presentation slide (e.g. a sponsor
   * backdrop) — a plain file under `UPLOAD_ROOT/presentations/<eventId>/`,
   * same as the rendered slide PNGs; no `Attachment` row. No size limit —
   * gated by admin/super_admin auth (`MandatoryAdminCookieGuard`), not by
   * content restrictions the way the participant-facing attachment upload is.
   */
  async uploadPresentationSlideImage(
    eventId: number,
    slideId: number,
    file: MulterFile,
  ): Promise<void> {
    const slide = await this.presentationSlideModel.findOne({
      where: { id: slideId, eventId },
    });
    if (!slide) {
      throw new NotFoundException('Slide not found');
    }

    const ext = BROWSER_IMAGE_MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const buffer = file.buffer ?? Buffer.alloc(0);
    if (buffer.length === 0) {
      throw new BadRequestException('Invalid image content');
    }

    const filename = `slide-${slideId}-upload.${ext}`;
    const dir = getPresentationDir(eventId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    await slide.update({ imagePath: filename });
  }

  /**
   * Logos/art an admin uploads for reuse across slides (as opposed to a
   * single slide's own `imagePath`). Available to slide `body` templates
   * via the `assets` Handlebars context (see `PresentationService`).
   */
  async listPresentationAssets(
    eventId: number,
  ): Promise<PresentationAssetsOverviewDto> {
    const dir = getPresentationAssetsDir(eventId);
    await mkdir(dir, { recursive: true });

    const entries = await readdir(dir, { withFileTypes: true });
    const assets = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() && sanitizePresentationAssetFilename(entry.name),
        )
        .map(async (entry) => {
          const fileStat = await stat(path.join(dir, entry.name));
          return {
            filename: entry.name,
            uploadedAt: fileStat.mtime.toISOString(),
          };
        }),
    );

    assets.sort((left, right) =>
      right.uploadedAt.localeCompare(left.uploadedAt),
    );

    return { assets };
  }

  async uploadPresentationAsset(
    eventId: number,
    file: MulterFile,
  ): Promise<PresentationAssetsOverviewDto> {
    const ext = BROWSER_IMAGE_MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const buffer = file.buffer ?? Buffer.alloc(0);
    if (buffer.length === 0) {
      throw new BadRequestException('Invalid image content');
    }

    const filename = slugifyAssetFilename(file.originalname, ext);
    const dir = getPresentationAssetsDir(eventId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return this.listPresentationAssets(eventId);
  }

  async deletePresentationAsset(
    eventId: number,
    filename: string,
  ): Promise<PresentationAssetsOverviewDto> {
    const filePath = resolvePresentationAssetFilePath(eventId, filename);
    if (!filePath) {
      throw new BadRequestException('Invalid asset filename');
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return this.listPresentationAssets(eventId);
  }

  /**
   * Builds the same Handlebars context `MailerService` uses for a real send,
   * for previewing templates in the admin. `recordId` loads a specific
   * User/Registration; without it, the first one (by id) stands in — always
   * a real row, never a hand-rolled placeholder, so the preview reflects a
   * real Event too.
   *
   * There is no `eventId` parameter: an admin's currently selected event is
   * just a UI convenience with no bearing on which record can be previewed.
   * `buildMailContext` resolves the Event itself from the loaded record's
   * own `eventId` — a person's event can be over (or differ from whatever
   * the admin currently has selected) and mail must still render correctly
   * for it, same as a real send.
   */
  async getMailTemplateContext(
    body: MailTemplateContextRequestDto,
  ): Promise<Record<string, unknown>> {
    const kind = body.recordType;
    if (!kind) {
      throw new BadRequestException('recordType is required');
    }

    const Model = (
      kind === 'registration' ? this.registrationModel : this.userModel
    ) as typeof User;
    const person = await (body.recordId
      ? Model.findOne({ where: { id: body.recordId } })
      : Model.findOne({ order: [['id', 'ASC']] }));

    if (!person) {
      throw new NotFoundException(
        body.recordId
          ? 'Context record not found'
          : `No ${kind} record found to preview with`,
      );
    }

    const project =
      kind === 'user'
        ? await this.loadOwnedProject(person.eventId, person.id)
        : undefined;

    const { context } = await buildMailContext({
      person,
      token: PREVIEW_TOKEN,
      project,
    }).catch(() => {
      throw new NotFoundException('Event not found for this record');
    });

    return context;
  }

  private async loadOwnedProject(
    eventId: number,
    userId: number,
  ): Promise<{ id: number; name: string } | undefined> {
    const membership = await this.userProjectModel.findOne({
      where: { eventId, userId, deletedAt: null },
      include: [
        {
          model: Project,
          required: true,
          where: { deletedAt: null },
          attributes: ['id', 'name'],
        },
      ],
      order: [
        ['isOwner', 'DESC'],
        ['id', 'ASC'],
      ],
    });

    const project = membership?.project;
    return project ? { id: project.id, name: project.name } : undefined;
  }

  /**
   * Bridges for the AdminJS Presentation preview page: `PresentationController`'s
   * own routes are guarded by HTTP Basic auth for Pi devices, so the admin's
   * cookie session calls these instead — same service, different guard.
   */
  async listPresentationSlides(eventId: number): Promise<SlideListResult> {
    return this.presentationService.listSlides(eventId);
  }

  async getPresentationSlideImage(
    eventId: number,
    key: string,
  ): Promise<SlideImageResult> {
    return this.presentationService.getSlideImage(eventId, key);
  }

  async listPresentationPreviewProjects(
    eventId: number,
  ): Promise<{ id: number; name: string }[]> {
    return this.presentationService.listVisibleProjectOptions(eventId);
  }

  async previewPresentationSlideDraft(
    eventId: number,
    body: PreviewPresentationSlideDraftDto,
  ): Promise<{ imageBase64: string }> {
    const buffer = await this.presentationService.previewSlideDraft(
      eventId,
      body,
    );
    return { imageBase64: buffer.toString('base64') };
  }
}
