import { Column, Table, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';
import { Question } from './question.model';
import { BaseEventModel } from './base_event.model';

@Table
export class QuestionUser extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Question)
  @Column
  questionId: number;
}
