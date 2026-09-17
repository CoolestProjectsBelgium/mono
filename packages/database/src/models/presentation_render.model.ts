import { Column, Table, DataType, Index } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

/**
 * The render-cache index for the presentation deck: one row per rendered
 * (slide key, resolution) pair. `contentHash` is compared against a freshly
 * computed hash of the slide's data on every request — a match means the
 * cached `imagePath` can be streamed as-is, no Puppeteer needed. The hash
 * itself is resolution-independent (render size doesn't affect content), so
 * a content change invalidates every cached resolution for that slide at
 * once — each lazily re-renders on its own next request.
 */
@Table
export class PresentationRender extends BaseEventModel {
  // slideKey alone used to be globally unique (it embeds PresentationSlide's
  // own auto-incrementing id, e.g. `slide-42` / `slide-42-7`); now paired
  // with resolution since the same slide can be cached at several sizes.
  @Index({ name: 'presentation-render-slide-key-resolution-unique', unique: true })
  @Column(DataType.STRING(255))
  declare slideKey: string;

  // Defaulted to the pre-existing canonical resolution so DB_SYNC_ALTER can
  // add this NOT NULL column onto already-rendered rows without failing.
  @Index({ name: 'presentation-render-slide-key-resolution-unique', unique: true })
  @Column({
    type: DataType.STRING(16),
    allowNull: false,
    defaultValue: '1920x1080',
  })
  declare resolution: string;

  @Column(DataType.STRING(128))
  declare contentHash: string;

  /** Relative path under `UPLOAD_ROOT/presentations/<eventId>/`. */
  @Column(DataType.STRING(4096))
  declare imagePath: string;

  @Column
  declare generatedAt: Date;
}
