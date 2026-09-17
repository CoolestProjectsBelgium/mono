import { Column, Model, Table, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Account } from './account.model';

/**
 * One row per (presentation Account, source IP) — upserted on every
 * heartbeat call from a Pi's `sync-deck.sh`. The fleet commonly shares a
 * single Account, so IP is what actually distinguishes individual devices;
 * `lastSeenAt` lets staff tell which Pis have gone quiet.
 */
@Table
export class PresentationCheckin extends Model<
  InferAttributes<PresentationCheckin>,
  InferCreationAttributes<PresentationCheckin>
> {
  @ForeignKey(() => Account)
  @Index({ name: 'presentation-checkin-account-ip-unique', unique: true })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare accountId: number;

  @BelongsTo(() => Account)
  declare account?: Account;

  @Index({ name: 'presentation-checkin-account-ip-unique', unique: true })
  @Column({ type: DataType.STRING(45), allowNull: false })
  declare ipAddress: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare lastSeenAt: Date;
}
