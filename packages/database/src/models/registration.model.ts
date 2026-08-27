import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  Length,
  DataType,
  IsEmail,
  Index,
} from 'sequelize-typescript';
import { Question } from './question.model';
import { QuestionRegistration } from './question_registration.model';
import { Tshirt } from './tshirt.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Registration extends BaseEventModel {
  @ForeignKey(() => Tshirt)
  @Column
  tshirtId!: number;

  @BelongsTo(() => Tshirt)
  tshirt!: Tshirt;

  @BelongsToMany(() => Question, () => QuestionRegistration)
  questions!: Question[];

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language!: string;

  @Length({ min: 4, max: 4 })
  @Column({ type: DataType.INTEGER, allowNull: false })
  postalcode!: number;

  @Column(DataType.STRING(30))
  municipality_name!: string;

  @Column(DataType.STRING(100))
  street!: string;

  @Column(DataType.STRING(20))
  house_number!: string;

  @Column(DataType.STRING(20))
  box_number!: string;

  @IsEmail
  @Index({ name: 'email-event-unique', unique: true })
  @Column(DataType.STRING(254))
  email!: string;

  @Column
  firstname!: string;

  @Column
  lastname!: string;

  @Column({ type: DataType.ENUM('m', 'f', 'x'), allowNull: false })
  sex!: string;

  @Column(DataType.DATEONLY)
  birthmonth!: Date;

  @Column(DataType.STRING(255))
  via!: string;

  @Column({ type: DataType.ENUM('dojo', 'other'), allowNull: true })
  declare via_type: 'dojo' | 'other' | null;

  @Column(DataType.STRING(255))
  medical!: string;

  @Column(DataType.STRING(13))
  gsm!: string;

  @Column(DataType.STRING(13))
  gsm_guardian!: string;

  @Column(DataType.STRING(2000))
  internalinfo!: string;

  @IsEmail
  @Column({ type: DataType.STRING(254), allowNull: true })
  declare email_guardian: string | null;

  @Column(DataType.UUID)
  project_code!: string;

  @Column
  waiting_list!: boolean;

  @Column(DataType.STRING(100))
  project_name!: string;

  @Column(DataType.STRING(4000))
  project_descr!: string;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en') }) // mandatory for project owners
  project_lang!: string;

  @Column(DataType.STRING(100))
  project_type!: string;

  @Column
  max_tokens!: number;

  @Column(DataType.VIRTUAL(DataType.BOOLEAN))
  get overdue(): boolean {
    const creationDate = this.getDataValue('createdAt') as Date;
    const expiresIn = process.env.JWT_EXPIRES;

    if (!creationDate || !expiresIn) return false;

    const match = expiresIn.match(/^(\d+(?:\.\d+)?)([smhd])$/i);
    const duration = match
      ? Number(match[1]) * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 } as const)[match[2].toLowerCase() as 's' | 'm' | 'h' | 'd']
      : Number(expiresIn);

    return Number.isFinite(duration) && new Date(creationDate).getTime() + duration <= Date.now();
  }

}