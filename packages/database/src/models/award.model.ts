import { Column, Table, ForeignKey, BelongsTo, DataType, Index } from 'sequelize-typescript';
import { Project } from './project.model';
import { VoteCategory } from './vote_category.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Award extends BaseEventModel {
  @Index('unique_award')
  @Column
  eventId!: number;

  @ForeignKey(() => Project)
  @Column
  @Index('unique_award')
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @ForeignKey(() => VoteCategory)
  @Column({ type: DataType.INTEGER, allowNull: true })
  @Index('unique_award')
  categoryId!: number | null;

  @BelongsTo(() => VoteCategory)
  category!: VoteCategory;

  @Column(DataType.TEXT('long'))
  text!: String;
}
