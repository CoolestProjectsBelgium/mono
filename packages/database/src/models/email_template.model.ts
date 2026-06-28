import { Column, Table, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class EmailTemplate extends BaseEventModel {
  @Column
  declare template: string;

  @Column
  declare language: string;

  @Column
  declare subject: string;

  @Column
  declare contentPlain: string;

  @Column
  declare contentRich: string;
}
