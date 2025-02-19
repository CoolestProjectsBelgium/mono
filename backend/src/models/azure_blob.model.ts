import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { Attachment } from './attachment.model';
import { BaseEventModel } from './base_event.model';

@Table
export class AzureBlob extends BaseEventModel {
  @Column
  container_name: string;

  @Column
  blob_name: string;

  @Column
  size: number;

  @ForeignKey(() => Attachment)
  @Column
  attachmentId: number;

  @BelongsTo(() => Attachment)
  attachment: Event;
}
