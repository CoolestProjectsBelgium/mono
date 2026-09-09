import { Column, Table, DataType, Index } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

/**
 * The render-cache index for the presentation deck: one row per rendered
 * slide key. `contentHash` is compared against a freshly computed hash of
 * the slide's data on every request — a match means the cached `imagePath`
 * can be streamed as-is, no Puppeteer needed.
 */
@Table
export class PresentationRender extends BaseEventModel {
  // Globally unique already — slideKey embeds PresentationSlide's own
  // (globally auto-incrementing) id, e.g. `slide-42` / `slide-42-7`.
  @Index({ name: 'presentation-render-slide-key-unique', unique: true })
  @Column(DataType.STRING(255))
  declare slideKey: string;

  @Column(DataType.STRING(128))
  declare contentHash: string;

  /** Relative path under `UPLOAD_ROOT/presentations/<eventId>/`. */
  @Column(DataType.STRING(4096))
  declare imagePath: string;

  @Column
  declare generatedAt: Date;
}
