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
import { BelongsToGetAssociationMixin } from 'sequelize';

@Table
export class Voucher extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  participantId!: number | null;

  @BelongsTo(() => User)
  participant!: User;

  @Index({ unique: true })
  @Column(DataType.UUID)
  voucherGuid!: string;


  public getProject!: BelongsToGetAssociationMixin<Project>;
}