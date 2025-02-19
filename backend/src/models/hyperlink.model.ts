import {
  Column,
  Table,
  BelongsTo,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Attachment } from './attachment.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Hyperlink extends BaseEventModel {
  @Column(DataType.STRING(255))
  href: string;

  @BelongsTo(() => Attachment)
  attachment: Attachment;

  @ForeignKey(() => Attachment)
  @Column
  attachmentId: number;
}
