import { Column, Table, ForeignKey } from 'sequelize-typescript';

import { Question } from './question.model.js';
import { Registration } from './registration.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class QuestionRegistration extends BaseEventModel {
  @ForeignKey(() => Registration)
  @Column
  registrationId!: number;

  @ForeignKey(() => Question)
  @Column
  questionId!: number;
}
