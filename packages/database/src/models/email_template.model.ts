import { Column, Table, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class EmailTemplate extends BaseEventModel {
  @Column
  template!: string;

  @Column
  language!: string;

  @Column
  subject!: string;

  @Column
  contentPlain!: string;

  @Column
  contentRich!: string;
}
