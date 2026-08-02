import { Column, Table, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model.js';
import { Question } from './question.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class QuestionUser extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @ForeignKey(() => Question)
  @Column
  questionId!: number;
}
