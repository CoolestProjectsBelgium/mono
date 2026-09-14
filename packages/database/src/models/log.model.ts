import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table
export class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
  @Column({ type: DataType.STRING(128), allowNull: false })
  declare action: string;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare resource: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare accountId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare recordId: number;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare recordTitle: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare difference: Record<string, unknown> | null;
}
