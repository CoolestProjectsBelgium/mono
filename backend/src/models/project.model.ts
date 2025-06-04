import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Project extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  ownerId: number;

  @BelongsTo(() => User)
  owner: User;

  @Column
  name: string;

  @Column
  description: string;

  @Column
  type: string;

  @Column
  internalInformation: string;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language: string;

  @Column
  maxVoucher: number;
}
