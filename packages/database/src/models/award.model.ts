import { Column, Table, ForeignKey, BelongsTo, DataType, Index } from 'sequelize-typescript';
import { Project } from './project.model';
import { VoteCategory } from './vote_category.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Award extends BaseEventModel {
  @Index({ name: 'award_event_project_unique', unique: true })
  @Index({ name: 'award_event_category_unique', unique: true })
  @Column
  eventId!: number;

  @ForeignKey(() => Project)
  @Column
  @Index({ name: 'award_event_project_unique', unique: true })
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => VoteCategory)
  @Column({ type: DataType.INTEGER, allowNull: true })
  @Index({ name: 'award_event_category_unique', unique: true })
  categoryId!: number | null;

  @BelongsTo(() => VoteCategory)
  category!: VoteCategory;

  @Column(DataType.TEXT('long'))
  text!: String;
}
