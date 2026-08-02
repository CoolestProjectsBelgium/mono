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
  declare language: string;

  @ForeignKey(() => Question)
  @Column
  declare questionId: number;

  @Column(DataType.STRING(255))
  declare description: string;

  @Column(DataType.STRING(120))
  declare positive: string;

  @Column(DataType.STRING(120))
  declare negative: string;

  @BelongsTo(() => Question)
  declare question: Event;
}
