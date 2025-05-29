import { Column, Table, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table
export class EmailTemplate extends BaseEventModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @PrimaryKey
  @Column
  template: string;

  @PrimaryKey
  @Column
  language: string;

  @Column
  subject: string;

  @Column
  contentPlain: string;

  @Column
  contentRich: string;
}
