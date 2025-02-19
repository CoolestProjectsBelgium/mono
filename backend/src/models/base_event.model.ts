import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './event.model';

@Table
export class BaseEventModel extends Model {
  @ForeignKey(() => Event)
  @Column({ allowNull: false })
  eventId: number;

  @BelongsTo(() => Event)
  event: Event;

  static setAdminEventScopes(scopeprefix: string = 'event', eventId: number[]) {
    for (const id of eventId) {
      this.addScope(`${scopeprefix}${id}`, {
        where: { eventId: id },
      });
    }
  }
}
