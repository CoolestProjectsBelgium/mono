import {
    Column,
    Table,
    DataType,
    PrimaryKey,
    UpdatedAt,
    CreatedAt,
} from 'sequelize-typescript';

@Table({ freezeTableName: true, tableName: 'admin_sessions', timestamps: false })
export class AdminSession {

    @PrimaryKey
    @Column(DataType.STRING(36))
    sid!: string;

    @Column(DataType.DATE)
    expires!: Date;

    @Column(DataType.TEXT)
    data!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;
}
