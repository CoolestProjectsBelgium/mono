import { Column, Table, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Project } from './project.model.js';
import { Account } from './account.model.js';
import { VoteCategory } from './vote_category.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Vote extends BaseEventModel {
  @Column(DataType.INTEGER)
  amount!: number;

  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @BelongsTo(() => Account)
  acccount!: Account;

  @ForeignKey(() => Account)
  @Column
  accountId!: number;

  @BelongsTo(() => VoteCategory)
  category!: VoteCategory;

  @ForeignKey(() => VoteCategory)
  @Column
  categoryId!: number;
}
