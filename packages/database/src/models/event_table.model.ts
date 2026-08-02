import { Project } from './project.model';
import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';
import { BelongsToGetAssociationMixin } from 'sequelize';


@Table({ tableName: 'Tables' })
export class EventTable extends BaseEventModel {
  @BelongsTo(() => Project)
  declare project: Project;

  @ForeignKey(() => Project)
  @Column
  declare projectId: number;

  @Column
  declare name: string;

  @Column(DataType.JSON)
  declare requirements: string;

  @Column
  declare maxPlaces: number;

  public getProject!: BelongsToGetAssociationMixin<Project>;
}
