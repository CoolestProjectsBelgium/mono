import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './project.model';
import { EventTable } from './event_table.model';
import { BaseEventModel } from './base_event.model';

@Table
export class ProjectTable extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @ForeignKey(() => EventTable)
  @Column
  tableId: number;

  @BelongsTo(() => EventTable)
  table: EventTable;
}
