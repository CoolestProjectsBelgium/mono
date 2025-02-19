import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Project extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  ownerId: number;

  @BelongsTo(() => User)
  owner: User;
}
