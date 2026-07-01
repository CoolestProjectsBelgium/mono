import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class EmailTemplate extends BaseEventModel {
  @Column
  declare template: string;

  @Column
  declare language: string;

  @Column(DataType.STRING(255))
  declare subject: string;

  @Column(DataType.TEXT('medium'))
  declare contentPlain: string;

  @Column(DataType.TEXT('medium'))
  declare contentRich: string;
}
