import { TshirtGroupTranslation } from './tshirt_group_translation.model';
import { Tshirt } from './tshirt.model';
import { Column, Table, HasMany } from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model';

@Table
export class TshirtGroup extends BaseEventModel {
  @HasMany(() => TshirtGroupTranslation)
  translations: TshirtGroupTranslation[];

  @HasMany(() => Tshirt)
  tshirts: Tshirt[];

  @Column
  name: string;
}
