import {
  Column,
  Table,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { BaseEventModel } from './base_event.model.js';
import { BelongsToGetAssociationMixin } from 'sequelize';

@Table
export class Attachment extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @Column
  confirmed!: boolean;

  @Column
  internal!: boolean;

  @Column(DataType.STRING(255))
  filename!: string;

  @Column(DataType.STRING(50))
  name!: string;

  @BelongsTo(() => Project)
  project!: Project;

  @Column(DataType.STRING(50))
  mimetype!: string;

  @Column(DataType.INTEGER)
  size!: number;

  public getProject!: BelongsToGetAssociationMixin<Project>;
}
