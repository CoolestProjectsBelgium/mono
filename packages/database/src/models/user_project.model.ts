import { BaseEventModel } from './base_event.model';
import {
    Column,
    Table,
    ForeignKey,
    BelongsTo,
    Index,
    DataType,
    PrimaryKey,
    AutoIncrement
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { User } from './user.model.js';
import { HasOneGetAssociationMixin } from 'sequelize';

@Table
export class UserProject extends BaseEventModel {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column
    isOwner!: boolean;

    @Index({ unique: true })
    @Column(DataType.UUID)
    voucherGuid!: string;

    @BelongsTo(() => Project)
    declare project: Project;

    @ForeignKey(() => Project)
    @Column
    declare projectId: number;

    @BelongsTo(() => User, { foreignKey: 'userId', constraints: false })
    declare user: User;

    @ForeignKey(() => User)
    @Column({ allowNull: true })
    declare userId: number;

    @Column({ allowNull: true, type: DataType.DATE })
    declare deletedAt: Date;

    public getProject!: HasOneGetAssociationMixin<Project>;
}
