import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  BelongsToMany,
  HasMany,
  HasOne
} from 'sequelize-typescript';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';
import { BelongsToGetAssociationMixin, HasManyHasAssociationMixin, BelongsToManyGetAssociationsMixin, HasOneGetAssociationMixin } from 'sequelize';
import { Voucher } from './voucher.model';
import { Attachment } from './attachment.model';
import { EventTable } from './event_table.model';

@Table
export class Project extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  ownerId!: number;

  @BelongsTo(() => User)
  owner!: User;

  @Column
  name!: string;

  @Column
  description!: string;

  @Column
  type!: string;

  @Column
  internalInformation!: string;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language!: string;
  
  @BelongsToMany(() => User, () => Voucher)
  participants!: User[];

  @HasMany(() => Attachment)
  attachments!: Attachment[];

  @Column
  maxVoucher!: number;

  @HasOne(() => EventTable)
  table!: EventTable;

  public getOwner!: BelongsToGetAssociationMixin<User>;
  public getParticipants!: BelongsToManyGetAssociationsMixin<User>;
  public getAttachments!: HasManyHasAssociationMixin<Attachment, number>;
  public getTable!: HasOneGetAssociationMixin<EventTable>;

}
