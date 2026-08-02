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
  declare language: string;

  @Column(DataType.STRING(250))
  declare description: string;

  @BelongsTo(() => TshirtGroup)
  declare group: TshirtGroup;

  @ForeignKey(() => TshirtGroup)
  @Column
  declare groupId: number;
}
