import { Project } from './project.model.js';
import { ProjectTable } from './project_table.model.js';
import { Location } from './location.model.js';
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
  table!: EventTable;

  @Column
  name!: string;

  @Column(DataType.JSON)
  requirements!: string;

  @Column
  maxPlaces!: number;

  @ForeignKey(() => Location)
  @Column
  locationId!: number;

  @BelongsTo(() => Location)
  location!: Location;
}
