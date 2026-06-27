import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Event } from './event.model';

@Table
export class BaseEventModel extends Model<BaseEventModel> {
  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventId!: number;

  @BelongsTo(() => Event)
  event!: Event;

  static setAdminEventScopes(eventId: number[], scopeprefix: string = 'event') {
    for (const id of eventId) {
      this.addScope(`${scopeprefix}${id}`, {
        where: { eventId: id },
      });
    }
  }
}
