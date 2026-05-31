import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './project.model.js';
import { VoteCategory } from './vote_category.model.js';
import { Account } from './account.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Award extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => VoteCategory)
  @Column
  categoryId!: number;

  @BelongsTo(() => VoteCategory)
  category!: VoteCategory;

  @ForeignKey(() => Account)
  @Column
  jurorId!: number;

  @BelongsTo(() => Account)
  juror!: Account;
}
