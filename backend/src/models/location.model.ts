import { Table, HasMany, DataType, Column } from 'sequelize-typescript';
import { EventTable } from './event_table.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Location extends BaseEventModel {
  @HasMany(() => EventTable)
  tables: EventTable[];

  @Column({ allowNull: false, type: DataType.STRING(10) })
  text: string;
}
