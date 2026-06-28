import { TshirtGroupTranslation } from './tshirt_group_translation.model.js';
import { Tshirt } from './tshirt.model.js';
import { Column, Table, HasMany } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class TshirtGroup extends BaseEventModel {
  @HasMany(() => TshirtGroupTranslation)
  translations!: TshirtGroupTranslation[];

  @HasMany(() => Tshirt)
  declare tshirts: Tshirt[];

  @Column
  declare name: string;
}
