import {
  Column,
  DataType,
  Table,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model.js';
import { Registration } from './registration.model.js';
import { QuestionUser } from './question_user.model.js';
import { QuestionRegistration } from './question_registration.model.js';
import { QuestionTranslation } from './question_translation.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Question extends BaseEventModel {
  @Column(DataType.STRING(30))
  declare name: string;

  @Column
  declare mandatory: boolean;

  @BelongsToMany(() => User, () => QuestionUser)
  users!: User[];

  @BelongsToMany(() => Registration, () => QuestionRegistration)
  registrations!: Registration[];

  @HasMany(() => QuestionTranslation)
  translations!: QuestionTranslation[];
}
