import {
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { TshirtGroup } from './tshirt_group.model';
import { TshirtTranslation } from './tshirt_translation.model';
import { BaseEventModel } from './base_event.model';

@Table
export class Tshirt extends BaseEventModel {
  @BelongsTo(() => TshirtGroup)
  group: TshirtGroup;

  @ForeignKey(() => TshirtGroup)
  @Column
  groupId: number;

  @Column
  name: string;

  @HasMany(() => TshirtTranslation)
  translations: TshirtTranslation[];
}
