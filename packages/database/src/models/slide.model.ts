import {
  Column,
  DataType,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Slide extends BaseEventModel {

  @Index('slide_position_index')
  @Column
  eventId!: number;

  @Column(DataType.ENUM('project', 'event', 'none'))
  datasource!: string;

  @Column(DataType.TEXT('long'))
  html!: string;

  @Column(DataType.INTEGER)
  @Index('slide_position_index')
  position!: number;
}
