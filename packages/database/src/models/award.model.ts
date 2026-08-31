import { Column, Table, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Project } from './project.model';
import { VoteCategory } from './vote_category.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Award extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => VoteCategory)
  @Column({ allowNull: true })
  categoryId!: number;

  @BelongsTo(() => VoteCategory)
  category!: VoteCategory;

  @Column(DataType.TEXT('long'))
  text!: String;
}
