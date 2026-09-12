import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  Index,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Certificate extends BaseEventModel {
  @Index({ name: 'certificate_event_project_unique', unique: true })
  @Column
  eventId!: number;

  @ForeignKey(() => Project)
  @Column
  @Index({ name: 'certificate_event_project_unique', unique: true })
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @Column(DataType.STRING(4000))
  text!: string;
}
