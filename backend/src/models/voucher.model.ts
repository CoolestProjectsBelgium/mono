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
  @Column({ autoIncrement: true, primaryKey: true }) //we need to add this to force sequelize to not to add composite keys for many-to-many relations
  id: number;

  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
  participantId: number;

  @BelongsTo(() => User)
  participant: User;

  @Index({ unique: true })
  @Column(DataType.UUID)
  voucherGuid: string;


  public getProject!: BelongsToGetAssociationMixin<Project>;
}
