import {
  Column,
  DataType,
  Table,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Registration } from './registration.model';
import { QuestionUser } from './question_user.model';
import { QuestionRegistration } from './question_registration.model';
import { QuestionTranslation } from './question_translation.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Question extends BaseEventModel {
  @Column(DataType.STRING(30))
  name: string;

  @Column
  mandatory: boolean;

  @BelongsToMany(() => User, () => QuestionUser)
  users: User[];

  @BelongsToMany(() => Registration, () => QuestionRegistration)
  registrations: Registration[];

  @HasMany(() => QuestionTranslation)
  translations: QuestionTranslation[];
}
