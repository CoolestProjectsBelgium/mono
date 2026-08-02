import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';
import { MailTemplates } from './email_template.model';

@Table
export class EmailLog extends BaseEventModel {
  @Column({ type: DataType.ENUM(...Object.values(MailTemplates)), allowNull: false })
  declare template: string;

  @Column
  declare to: string;

  @Column
  declare messageId: string;

  @Column({ type: DataType.ENUM('sent', 'failed'), allowNull: false })
  declare status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare error?: string;

}