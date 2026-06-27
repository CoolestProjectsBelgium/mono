import {
  Column,
  Table,
  ForeignKey,
  DataType,
  HasOne,
} from 'sequelize-typescript';
import { Project } from './project.model.js';
import { AzureBlob } from './azure_blob.model.js';
import { Hyperlink } from './hyperlink.model.js';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Attachment extends BaseEventModel {
  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @Column
  confirmed!: boolean;

  @Column
  internal!: boolean;

  @Column(DataType.STRING(255))
  filename!: string;

  @Column(DataType.STRING(50))
  name!: string;

  @HasOne(() => AzureBlob)
  azureBlob!: AzureBlob;

  @HasOne(() => Hyperlink)
  hyperlink!: Hyperlink;
}
