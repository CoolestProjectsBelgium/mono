import { BaseEventModel } from './base_event.model.js';
import {
    Column,
    Table,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { User } from './user.model.js';

@Table
export class UserProject extends BaseEventModel {
    @Column
    isOwner!: boolean;

    @BelongsTo(() => Project)
    declare project: Project;

    @ForeignKey(() => Project)
    @Column
    declare projectId: number;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => User)
    @Column
    declare userId: number;
}
