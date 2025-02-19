import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './project.model';
import { Account } from './account.model';
import { VoteCategory } from './vote_category.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Vote extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @BelongsTo(() => Account)
  acccount: Account;

  @ForeignKey(() => Account)
  @Column
  accountId: number;

  @BelongsTo(() => VoteCategory)
  category: VoteCategory;

  @ForeignKey(() => VoteCategory)
  @Column
  categoryId: number;
}
