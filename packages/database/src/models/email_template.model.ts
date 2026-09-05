import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

export enum MailTemplates {
  registration = 'registration',
  waiting = 'waiting',
  welcomeOwner = 'welcomeOwner',
  welcomeCoWorker = 'welcomeCoWorker',
  delete = 'delete',
  warningNoProject = 'warningNoProject',
  deadlineApproaching = 'deadlineApproaching',
  waitingMail = 'waitingMail',
  activation = 'activation',
  ask4Token = 'ask4Token',
  emailExists = 'emailExists',
  notifyNewProjectOwner = 'notifyNewProjectOwner',
}

@Table
export class EmailTemplate extends BaseEventModel {
  @Column({ type: DataType.ENUM(...Object.values(MailTemplates)), allowNull: false })
  declare template: string;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  declare language: string;

  @Column
  declare subject: string;

  @Column(DataType.TEXT)
  declare contentPlain: string;

  @Column(DataType.TEXT)
  declare contentRich: string;

  @Column
  declare contextId: string;
  
}
