import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  HasOne,
} from 'sequelize-typescript';
import { Project } from './project.model';
import { AzureBlob } from './azure_blob.model';
import { Hyperlink } from './hyperlink.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Attachment extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @Column
  confirmed: boolean;

  @Column
  internal: boolean;

  @Column(DataType.STRING(255))
  filename: string;

  @Column(DataType.STRING(50))
  name: string;

  @HasOne(() => AzureBlob)
  azureBlob: AzureBlob;

  @HasOne(() => Hyperlink)
  hyperlink: Hyperlink;
}
