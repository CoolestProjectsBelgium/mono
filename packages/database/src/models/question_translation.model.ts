import {
  Column,
  DataType,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './event.model.js';
import { Question } from './question.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class QuestionTranslation extends BaseEventModel {
  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language!: string;

  @ForeignKey(() => Question)
  @Column
  questionId!: number;

  @Column(DataType.STRING(255))
  description!: string;

  @Column(DataType.STRING(120))
  positive!: string;

  @Column(DataType.STRING(120))
  negative!: string;

  @BelongsTo(() => Question)
  question!: Event;
}
