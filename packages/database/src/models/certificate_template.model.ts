import { Column, Table, DataType, Index } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class CertificateTemplate extends BaseEventModel {
  @Index({ name: 'certificate_template_event_language_unique', unique: true })
  @Column
  eventId!: number;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  @Index({ name: 'certificate_template_event_language_unique', unique: true })
  language!: string;

  @Column(DataType.TEXT('long'))
  bodyHtml!: string;
}
