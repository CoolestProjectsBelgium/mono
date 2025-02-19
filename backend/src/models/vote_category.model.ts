import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table
export class VoteCategory extends BaseEventModel {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  min: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  max: number;

  @Column
  public: boolean;

  @Column
  optional: boolean;
}
