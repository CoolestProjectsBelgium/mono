import {
  Column,
  Table,
  ForeignKey,
  IsEmail,
  Index,
  BelongsToMany,
  BelongsTo,
  HasOne,
  DataType,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { Project } from './project.model';
import { Question } from './question.model';
import { QuestionUser } from './question_user.model';
import { Tshirt } from './tshirt.model';
import { BaseEventModel } from './base_event.model';

@Table
export class User extends BaseEventModel {
  @ForeignKey(() => Tshirt)
  @Column
  tshirtId: number;

  @BelongsTo(() => Tshirt)
  tshirt: Event;

  @HasOne(() => Project)
  project: Project;

  @BelongsToMany(() => Question, () => QuestionUser)
  questions: Question[];

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1000,
      max: 9999,
    },
  })
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
  @Index({ name: 'email-event-unique-user', unique: true })
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

  @Column
  last_token: Date;

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
}
