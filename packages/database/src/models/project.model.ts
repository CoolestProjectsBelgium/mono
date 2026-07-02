import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';
import { BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import { Voucher } from './voucher.model';

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
  
  @HasMany(() => Voucher)
  vouchers!: Voucher[];

  @Column
  maxVoucher!: number;

  public getOwner!: BelongsToGetAssociationMixin<User>;
  public getVouchers!: HasManyGetAssociationsMixin<Voucher>;
}
