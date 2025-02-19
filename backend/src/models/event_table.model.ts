import { Event } from './event.model';
import { Project } from './project.model';
import { ProjectTable } from './project_table.model';
import { Location } from './location.model';
import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table({ tableName: 'Tables' })
export class EventTable extends BaseEventModel {
  @BelongsToMany(() => Project, () => ProjectTable)
  table: EventTable;

  @Column
  name: string;

  @Column(DataType.JSON)
  requirements: string;

  @Column
  maxPlaces: number;

  @ForeignKey(() => Location)
  @Column
  locationId: number;

  @BelongsTo(() => Location)
  location: Location;
}
