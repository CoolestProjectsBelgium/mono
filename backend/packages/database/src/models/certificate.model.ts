import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Certificate extends BaseEventModel {
  @Column(DataType.STRING(4000))
  text!: string;

  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;
}
