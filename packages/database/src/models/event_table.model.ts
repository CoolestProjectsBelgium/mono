import { Project } from './project.model';
import { ProjectTable } from './project_table.model';
import { Location } from './location.model';
import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table({ tableName: 'Tables' })
export class EventTable extends BaseEventModel {
  @BelongsToMany(() => Project, () => ProjectTable)
  declare table: EventTable;

  @Column
  declare name: string;

  @Column(DataType.JSON)
  declare requirements: string;

  @Column
  declare maxPlaces: number;

  @ForeignKey(() => Location)
  @Column
  declare locationId: number;

  @BelongsTo(() => Location)
  declare location: Location;
}
