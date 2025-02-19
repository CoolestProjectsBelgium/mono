import { Event } from './event.model';
import { TshirtGroup } from './tshirt_group.model';
import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table
export class TshirtGroupTranslation extends BaseEventModel {
  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language: string;

  @Column(DataType.STRING(250))
  description: string;

  @BelongsTo(() => TshirtGroup)
  group: Event;

  @ForeignKey(() => TshirtGroup)
  @Column
  groupId: number;
}
