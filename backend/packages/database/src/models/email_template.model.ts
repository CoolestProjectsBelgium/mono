import { Column, Table, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class EmailTemplate extends BaseEventModel {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  declare id: number;

  @PrimaryKey
  @Column
  template!: string;

  @PrimaryKey
  @Column
  language!: string;

  @Column
  subject!: string;

  @Column
  contentPlain!: string;

  @Column
  contentRich!: string;
}
