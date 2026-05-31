import { Table, HasMany, DataType, Column } from 'sequelize-typescript';
import { EventTable } from './event_table.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Location extends BaseEventModel {
  @HasMany(() => EventTable)
  tables!: EventTable[];

  @Column({ allowNull: false, type: DataType.STRING(10) })
  text!: string;
}
