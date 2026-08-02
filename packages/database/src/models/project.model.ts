import {
  Column,
  Table,
  ForeignKey,
  DataType,
  BelongsToMany,
  HasMany,
  HasOne
} from 'sequelize-typescript';
import { User } from './user.model';
import { BaseEventModel } from './base_event.model';
import { HasManyGetAssociationsMixin, BelongsToManyGetAssociationsMixin, HasOneGetAssociationMixin } from 'sequelize';
import { Attachment } from './attachment.model';
import { EventTable } from './event_table.model';
import { UserProject } from './user_project.model';

@Table
export class Project extends BaseEventModel {

  @Column
  name!: string;

  @Column
  description!: string;

  @Column
  type!: string;

  @Column
  internalInformation!: string;

  @Column({ type: DataType.ENUM('nl', 'fr', 'en'), allowNull: false })
  language!: string;

  @HasMany(() => Attachment)
  attachments!: Attachment[];

  @Column
  maxVoucher!: number;

  @HasOne(() => EventTable)
  table!: EventTable;

  @BelongsToMany(() => User, {
    through: { model: () => UserProject, unique: false },
    as: 'users',
    foreignKey: { name: 'projectId', allowNull: false },
    otherKey: { name: 'userId', allowNull: true },
    constraints: false,
  })
  users!: User[];

  public async getOwner() {
    const owners = await this.getParticipants({ where: { isOwner: true, deletedAt: null } });
    if (owners) {
      return owners[0]
    }
  }

  public getParticipants!: BelongsToManyGetAssociationsMixin<User>;
  public getAttachments!: HasManyGetAssociationsMixin<Attachment>;
  public getTable!: HasOneGetAssociationMixin<EventTable>;
}
