import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Award,
  Certificate,
  CertificateRender,
  CertificateTemplate,
  Event,
  Project,
  User,
  UserProject,
  VoteCategory,
} from '@coolestprojects/database';
import { Op } from 'sequelize';
import * as Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { MulterFile } from '../file-upload/multer-file.type';
import {
  CertificateAssetsOverviewDto,
  ParticipantCertificateStatusDto,
} from '../dto/certificate.dto';
import {
  getCertificateAssetsDir,
  getCertificateDir,
  resolveCertificateAssetFilePath,
  sanitizeCertificateAssetFilename,
} from './certificate-path';

/**
 * Admin logo/seal/signature uploads end up as a `data:` URI inlined into
 * HTML that Puppeteer renders — the extension just needs to match what
 * Chromium can decode. Keyed by mimetype rather than trusting the
 * client-supplied filename, so the saved extension and actual content can
 * never disagree. Mirrors the identical map in `admin.service.ts` for
 * presentation assets.
 */
const BROWSER_IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/** Re-uploading the same original name overwrites its asset. */
function slugifyAssetFilename(originalName: string, ext: string): string {
  const base = path.basename(originalName, path.extname(originalName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'asset'}.${ext}`;
}

/** A participant's raw, DB-only data — cheap to fetch, safe to hash directly (no file reads). */
interface ParticipantRecord {
  projectId: number;
  projectName: string;
  userId: number;
  firstname: string;
  lastname: string;
  language: string;
  isOwner: boolean;
  certificateText: string;
  awardWon: boolean;
  awardCategoryName: string | null;
}

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserProject)
    private readonly userProjectModel: typeof UserProject,
    @InjectModel(Certificate)
    private readonly certificateModel: typeof Certificate,
    @InjectModel(CertificateTemplate)
    private readonly certificateTemplateModel: typeof CertificateTemplate,
    @InjectModel(CertificateRender)
    private readonly certificateRenderModel: typeof CertificateRender,
    @InjectModel(Award)
    private readonly awardModel: typeof Award,
  ) {}

  async listParticipantStatus(
    eventId: number,
  ): Promise<ParticipantCertificateStatusDto[]> {
    const participants = await this.loadParticipants(eventId);
    const templatesByLanguage = await this.loadTemplatesByLanguage(eventId);
    const assetsFingerprint = await this.loadAssetsFingerprint(eventId);

    const renders = await this.certificateRenderModel.findAll({
      where: { eventId },
    });
    const renderByKey = new Map(
      renders.map((render) => [
        this.participantKey(render.projectId, render.userId),
        render,
      ]),
    );

    return participants.map((participant) => {
      const template = templatesByLanguage.get(participant.language);
      let upToDate = false;
      let generatedAt: string | null = null;

      if (template) {
        const hash = this.hashCertificate(
          template.bodyHtml,
          participant,
          assetsFingerprint,
        );
        const render = renderByKey.get(
          this.participantKey(participant.projectId, participant.userId),
        );
        upToDate = Boolean(render && render.contentHash === hash);
        generatedAt = upToDate ? render!.generatedAt.toISOString() : null;
      }

      return {
        userId: participant.userId,
        projectId: participant.projectId,
        userName: `${participant.firstname} ${participant.lastname}`.trim(),
        projectName: participant.projectName,
        isOwner: participant.isOwner,
        language: participant.language,
        certificateText: participant.certificateText,
        awardWon: participant.awardWon,
        awardCategoryName: participant.awardCategoryName,
        hasTemplate: Boolean(template),
        upToDate,
        generatedAt,
      };
    });
  }

  /**
   * Renders a certificate with caller-supplied `bodyHtml`/`text` instead of
   * the saved ones — for the admin quick-edit preview. Never writes to
   * `CertificateRender` or disk: this is a throwaway render.
   */
  async previewCertificateDraft(
    eventId: number,
    input: {
      projectId: number;
      userId: number;
      bodyHtml: string;
      text: string;
    },
  ): Promise<Buffer> {
    const event = await this.loadEvent(eventId);
    const participant = await this.findParticipant(
      eventId,
      input.projectId,
      input.userId,
    );
    const assets = await this.loadAssetsContext(eventId);
    const context = this.buildCertificateContext(
      event,
      { ...participant, certificateText: input.text },
      assets,
    );
    const html = this.compileCertificateHtml(input.bodyHtml, context);
    return this.renderPdf(html);
  }

  async getCertificatePdf(
    eventId: number,
    projectId: number,
    userId: number,
  ): Promise<{ file: StreamableFile; hash: string; generatedAt: Date }> {
    const event = await this.loadEvent(eventId);
    const participant = await this.findParticipant(eventId, projectId, userId);
    const template = await this.loadTemplate(eventId, participant.language);
    if (!template) {
      throw new NotFoundException(
        `No certificate template for language "${participant.language}"`,
      );
    }

    const assetsFingerprint = await this.loadAssetsFingerprint(eventId);
    const hash = this.hashCertificate(
      template.bodyHtml,
      participant,
      assetsFingerprint,
    );

    let render = await this.certificateRenderModel.findOne({
      where: { eventId, projectId, userId },
    });

    if (!render || render.contentHash !== hash) {
      const filePath = await this.renderCertificate(
        eventId,
        event,
        template,
        participant,
      );
      const generatedAt = new Date();
      if (render) {
        await render.update({ contentHash: hash, filePath, generatedAt });
      } else {
        render = await this.certificateRenderModel.create({
          eventId,
          projectId,
          userId,
          contentHash: hash,
          filePath,
          generatedAt,
        });
      }
    }

    const fullPath = path.join(getCertificateDir(eventId), render.filePath);
    const buffer = await readFile(fullPath);

    return {
      file: new StreamableFile(buffer, { type: 'application/pdf' }),
      hash: render.contentHash,
      generatedAt: render.generatedAt,
    };
  }

  async listCertificateAssets(
    eventId: number,
  ): Promise<CertificateAssetsOverviewDto> {
    const dir = getCertificateAssetsDir(eventId);
    await mkdir(dir, { recursive: true });

    const entries = await readdir(dir, { withFileTypes: true });
    const assets = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() && sanitizeCertificateAssetFilename(entry.name),
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

  async uploadCertificateAsset(
    eventId: number,
    file: MulterFile,
  ): Promise<CertificateAssetsOverviewDto> {
    const ext = BROWSER_IMAGE_MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const buffer = file.buffer ?? Buffer.alloc(0);
    if (buffer.length === 0) {
      throw new BadRequestException('Invalid image content');
    }

    const filename = slugifyAssetFilename(file.originalname, ext);
    const dir = getCertificateAssetsDir(eventId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return this.listCertificateAssets(eventId);
  }

  async deleteCertificateAsset(
    eventId: number,
    filename: string,
  ): Promise<CertificateAssetsOverviewDto> {
    const filePath = resolveCertificateAssetFilePath(eventId, filename);
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

    return this.listCertificateAssets(eventId);
  }

  private participantKey(projectId: number, userId: number): string {
    return `${projectId}-${userId}`;
  }

  private async loadEvent(eventId: number): Promise<Event> {
    const event = await this.eventModel.findByPk(eventId, {
      attributes: ['id', 'eventTitle'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async loadTemplate(
    eventId: number,
    language: string,
  ): Promise<CertificateTemplate | null> {
    return this.certificateTemplateModel.findOne({
      where: { eventId, language },
    });
  }

  private async loadTemplatesByLanguage(
    eventId: number,
  ): Promise<Map<string, CertificateTemplate>> {
    const templates = await this.certificateTemplateModel.findAll({
      where: { eventId },
    });
    return new Map(templates.map((template) => [template.language, template]));
  }

  private async findParticipant(
    eventId: number,
    projectId: number,
    userId: number,
  ): Promise<ParticipantRecord> {
    const participants = await this.loadParticipants(eventId);
    const participant = participants.find(
      (candidate) =>
        candidate.projectId === projectId && candidate.userId === userId,
    );
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    return participant;
  }

  /**
   * Every participant (project + user, via `UserProject`) for the event,
   * joined with that project's certificate text (falling back to the
   * project's award text if no `Certificate` row has been created/edited
   * yet) and award-won status.
   */
  private async loadParticipants(
    eventId: number,
  ): Promise<ParticipantRecord[]> {
    const memberships = await this.userProjectModel.findAll({
      where: { eventId, deletedAt: null, userId: { [Op.ne]: null } },
      include: [
        { model: this.projectModel, where: { deletedAt: null }, required: true },
        { model: this.userModel, required: true },
      ],
    });

    const projectIds = [...new Set(memberships.map((m) => m.projectId))];

    const certificates = projectIds.length
      ? await this.certificateModel.findAll({
          where: { eventId, projectId: { [Op.in]: projectIds } },
        })
      : [];
    const certificateByProject = new Map(
      certificates.map((certificate) => [certificate.projectId, certificate]),
    );

    const awards = projectIds.length
      ? await this.awardModel.findAll({
          where: { eventId, projectId: { [Op.in]: projectIds } },
          include: [VoteCategory],
        })
      : [];
    const awardByProject = new Map(
      awards.map((award) => [award.projectId, award]),
    );

    return memberships.map((membership) => {
      const award = awardByProject.get(membership.projectId) ?? null;
      const certificate = certificateByProject.get(membership.projectId);
      return {
        projectId: membership.projectId,
        projectName: membership.project.name,
        userId: membership.userId,
        firstname: membership.user.firstname,
        lastname: membership.user.lastname,
        language: membership.user.language ?? 'en',
        isOwner: membership.isOwner,
        certificateText: certificate?.text ?? award?.text?.toString() ?? '',
        awardWon: Boolean(award?.categoryId),
        awardCategoryName: award?.category?.name ?? null,
      };
    });
  }

  private buildCertificateContext(
    event: Event,
    participant: ParticipantRecord,
    assets: Record<string, string>,
  ): Record<string, unknown> {
    return {
      event: { eventTitle: event.eventTitle },
      project: { id: participant.projectId, name: participant.projectName },
      participant: {
        firstname: participant.firstname,
        lastname: participant.lastname,
        isOwner: participant.isOwner,
        language: participant.language,
      },
      certificate: { text: participant.certificateText },
      award: {
        won: participant.awardWon,
        categoryName: participant.awardCategoryName,
      },
      assets,
    };
  }

  private compileCertificateHtml(
    bodyHtml: string,
    context: Record<string, unknown>,
  ): string {
    const template = Handlebars.compile(bodyHtml, { noEscape: true });
    const contentHtml = template(context);

    return `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }
</style>
</head>
<body>${contentHtml}</body>
</html>`;
  }

  private async renderPdf(html: string): Promise<Buffer> {
    // Containers (dev and deploy) run this as root with no user-namespace
    // sandboxing available — see the identical note in PresentationService.
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /** Only reached on a cache miss/stale hash — everything above this point is pure DB reads. */
  private async renderCertificate(
    eventId: number,
    event: Event,
    template: CertificateTemplate,
    participant: ParticipantRecord,
  ): Promise<string> {
    const assets = await this.loadAssetsContext(eventId);
    const context = this.buildCertificateContext(event, participant, assets);
    const html = this.compileCertificateHtml(template.bodyHtml, context);
    const pdf = await this.renderPdf(html);

    const dir = getCertificateDir(eventId);
    await mkdir(dir, { recursive: true });
    const filename = `certificate-${participant.projectId}-${participant.userId}.pdf`;
    await writeFile(path.join(dir, filename), pdf);
    return filename;
  }

  /**
   * Cheap stand-in for the hash: the raw text/name fields plus a fingerprint
   * of the assets folder (filenames + mtimes, not file contents) — never the
   * fully resolved `assets` data URIs, so a status poll never pays for
   * reading/base64-encoding every logo. Only an actual render
   * (`renderCertificate`/`previewCertificateDraft`, cache-miss-only) loads
   * the real data URIs via `loadAssetsContext`.
   */
  private hashCertificate(
    bodyHtml: string,
    participant: ParticipantRecord,
    assetsFingerprint: string,
  ): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          bodyHtml,
          text: participant.certificateText,
          firstname: participant.firstname,
          lastname: participant.lastname,
          isOwner: participant.isOwner,
          projectName: participant.projectName,
          awardWon: participant.awardWon,
          awardCategoryName: participant.awardCategoryName,
          assetsFingerprint,
        }),
      )
      .digest('hex');
  }

  private async loadAssetsFingerprint(eventId: number): Promise<string> {
    let entries;
    try {
      entries = await readdir(getCertificateAssetsDir(eventId), {
        withFileTypes: true,
      });
    } catch {
      return 'none';
    }

    const stats = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isFile() && sanitizeCertificateAssetFilename(entry.name),
        )
        .map(async (entry) => {
          const fileStat = await stat(
            path.join(getCertificateAssetsDir(eventId), entry.name),
          );
          return `${entry.name}:${fileStat.mtimeMs}:${fileStat.size}`;
        }),
    );

    return createHash('sha256').update(stats.sort().join('|')).digest('hex');
  }

  /** Logos/seals/signatures uploaded for the event, inlined as data URIs so Puppeteer never needs filesystem access from the page itself. */
  private async loadAssetsContext(
    eventId: number,
  ): Promise<Record<string, string>> {
    const assets: Record<string, string> = {};
    let entries;
    try {
      entries = await readdir(getCertificateAssetsDir(eventId), {
        withFileTypes: true,
      });
    } catch {
      return assets;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !sanitizeCertificateAssetFilename(entry.name)) {
        continue;
      }
      const dataUri = await this.toDataUri(
        path.join(getCertificateAssetsDir(eventId), entry.name),
      );
      if (dataUri) {
        assets[entry.name] = dataUri;
      }
    }
    return assets;
  }

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
}
