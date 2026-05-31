import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './project.model.js';
import { EventTable } from './event_table.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class ProjectTable extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => EventTable)
  @Column
  tableId!: number;

  @BelongsTo(() => EventTable)
  table!: EventTable;
}
