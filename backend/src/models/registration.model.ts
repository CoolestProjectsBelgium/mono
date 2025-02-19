import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  Length,
  DataType,
  IsEmail,
  Index,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { Question } from './question.model';
import { QuestionRegistration } from './question_registration.model';
import { Tshirt } from './tshirt.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Registration extends BaseEventModel {
  @ForeignKey(() => Event)
  @Index({ name: 'email-event-unique', unique: true })
  @Column
  eventId: number = 0; // override we want index on this place

  @ForeignKey(() => Tshirt)
  @Column
  tshirtId: number;

  @BelongsTo(() => Tshirt)
  tshirt: Tshirt;

  @BelongsToMany(() => Question, () => QuestionRegistration)
  questions: Question[];

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language: string;

  @Length({ min: 1000, max: 9999 })
  @Column({ type: DataType.INTEGER, allowNull: false })
  postalcode: number;

  @Column(DataType.STRING(30))
  municipality_name: string;

  @Column(DataType.STRING(100))
  street: string;

  @Column(DataType.STRING(20))
  house_number: string;

  @Column(DataType.STRING(20))
  box_number: string;

  @IsEmail
  @Index({ name: 'email-event-unique', unique: true })
  @Column(DataType.STRING(254))
  email: string;

  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column({ type: DataType.ENUM('m', 'f', 'x'), allowNull: false })
  sex: string;

  @Column(DataType.DATEONLY)
  birthmonth: Date;

  @Column(DataType.STRING(255))
  via: string;

  @Column(DataType.STRING(255))
  medical: string;

  @Column(DataType.STRING(13))
  gsm: string;

  @Column(DataType.STRING(13))
  gsm_guardian: string;

  @Column(DataType.STRING(2000))
  internalinfo: string;

  @IsEmail
  @Column(DataType.STRING(254))
  email_guardian: string;

  @Column(DataType.UUID)
  project_code: string;

  @Column
  waiting_list: boolean;

  @Column(DataType.STRING(100))
  project_name: string;

  @Column(DataType.STRING(4000))
  project_descr: string;

  @Column({ type: DataType.ENUM('m', 'f', 'x'), allowNull: false })
  project_lang: string;

  @Column(DataType.STRING(100))
  project_type: string;

  @Column
  max_tokens: number;
}
