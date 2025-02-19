import { Column, Table } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table({ timestamps: false })
export class Message extends BaseEventModel {
  @Column
  message: string;

  @Column
  startAt: Date;

  @Column
  endAt: Date;
}
