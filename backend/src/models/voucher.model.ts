import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  Index,
} from 'sequelize-typescript';
import { Project } from './project.model';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Voucher extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @ForeignKey(() => User)
  @Column
  participantId: number;

  @BelongsTo(() => User)
  participant: User;

  @Index({ unique: true })
  @Column(DataType.UUID)
  voucherGuid: number;
}
