import { Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Attachment } from './attachment.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class AzureBlob extends BaseEventModel {
  @Column
  container_name!: string;

  @Column
  blob_name!: string;

  @Column
  size!: number;

  @ForeignKey(() => Attachment)
  @Column
  attachmentId!: number;

  @BelongsTo(() => Attachment)
  attachment!: Attachment;
}
