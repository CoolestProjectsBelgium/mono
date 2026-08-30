import {
  Column,
  Table,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Affiliation extends BaseEventModel {

  @Column(DataType.STRING(50))
  name!: string;
}
