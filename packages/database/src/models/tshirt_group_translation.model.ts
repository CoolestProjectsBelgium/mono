import { Event } from './event.model.js';
import { TshirtGroup } from './tshirt_group.model.js';
import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class TshirtGroupTranslation extends BaseEventModel {
  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language!: string;

  @Column(DataType.STRING(250))
  description!: string;

  @BelongsTo(() => TshirtGroup)
  group!: TshirtGroup;

  @ForeignKey(() => TshirtGroup)
  @Column
  groupId!: number;
}
