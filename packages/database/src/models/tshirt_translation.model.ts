import { Tshirt } from './tshirt.model.js';
import { Column, Table, ForeignKey, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';
@Table
export class TshirtTranslation extends BaseEventModel {
  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  declare language: string;

  @Column(DataType.STRING(250))
  declare description: string;

  @ForeignKey(() => Tshirt)
  @Column
  declare tshirtId: number;
}
