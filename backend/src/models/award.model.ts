import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { Project } from './project.model';
import { VoteCategory } from './vote_category.model';
import { Account } from './account.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Award extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @ForeignKey(() => VoteCategory)
  @Column
  categoryId: number;

  @BelongsTo(() => VoteCategory)
  category: VoteCategory;

  @ForeignKey(() => Account)
  @Column
  jurorId: number;

  @BelongsTo(() => Account)
  juror: Account;
}
