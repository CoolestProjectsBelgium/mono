import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

export type PresentationSlideDataSource = 'none' | 'projects';
export type PresentationSlideCardinality = 'single' | 'perRecord';

/**
 * One row per slide in the deck (event info, per-project, project overview,
 * map, custom/sponsor — everything). `dataSource`/`cardinality` decide how
 * the row expands into one or many rendered slides — see
 * `apps/api/src/presentation/presentation.service.ts`.
 */
@Table
export class PresentationSlide extends BaseEventModel {
  @Column
  declare order: number;

  @Column
  declare title: string;

  @Column(DataType.ENUM('none', 'projects'))
  declare dataSource: PresentationSlideDataSource;

  @Column(DataType.ENUM('single', 'perRecord'))
  declare cardinality: PresentationSlideCardinality;

  @Column(DataType.TEXT)
  declare body: string;

  @Column
  declare time: number;

  /** Relative path under `UPLOAD_ROOT/presentations/<eventId>/` — plain filesystem asset, no Attachment row. */
  @Column({ type: DataType.STRING(4096), allowNull: true })
  declare imagePath: string | null;
}
