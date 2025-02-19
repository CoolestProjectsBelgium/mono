import { Column, Table, ForeignKey } from 'sequelize-typescript';

import { Question } from './question.model';
import { Registration } from './registration.model';
import { BaseEventModel } from './base_event.model';

@Table
export class QuestionRegistration extends BaseEventModel {
  @ForeignKey(() => Registration)
  @Column
  registrationId: number;

  @ForeignKey(() => Question)
  @Column
  questionId: number;
}
