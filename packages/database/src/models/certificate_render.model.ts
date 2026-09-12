import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  Index,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { User } from './user.model.js';
import { BaseEventModel } from './base_event.model.js';

/**
 * The render-cache index for certificates: one row per participant
 * (project + user). `contentHash` is compared against a freshly computed
 * hash of the certificate's template/text/assets on every request — a
 * match means the cached `filePath` can be streamed as-is, no Puppeteer
 * needed.
 */
@Table
export class CertificateRender extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  @Index({ name: 'certificate_render_participant_unique', unique: true })
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => User)
  @Column
  @Index({ name: 'certificate_render_participant_unique', unique: true })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.STRING(128))
  contentHash!: string;

  /** Relative path under UPLOAD_ROOT/certificates/<eventId>/. */
  @Column(DataType.STRING(4096))
  filePath!: string;

  @Column
  generatedAt!: Date;
}
