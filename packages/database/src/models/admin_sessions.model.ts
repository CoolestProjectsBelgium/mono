import {
    Column,
    Table,
    DataType,
    PrimaryKey,
    Model,
    UpdatedAt,
    CreatedAt,
} from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ freezeTableName: true, tableName: 'admin_sessions' })
export class AdminSession extends Model<InferAttributes<AdminSession>, InferCreationAttributes<AdminSession>>  {

    @PrimaryKey
    @Column(DataType.STRING(36))
    declare sid: string;

    @Column(DataType.DATE)
    declare expires: Date;

    @Column(DataType.TEXT)
    declare data: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}
