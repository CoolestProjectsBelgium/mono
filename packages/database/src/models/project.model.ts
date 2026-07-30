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
import { Voucher } from './voucher.model';
import { Attachment } from './attachment.model';
import { EventTable } from './event_table.model';
import { UserProject } from './user_project.model';

@Table
export class Project extends BaseEventModel {
  @ForeignKey(() => User)
  @Column
  ownerId!: number;

  @BelongsToMany(() => User, { through: () => UserProject, as: 'members', })
  members!: Array<User & { membership: UserProject }>;

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
  
  @BelongsToMany(() => User, () => Voucher)
  participants!: User[];

  @HasMany(() => Attachment)
  attachments!: Attachment[];

  @Column
  maxVoucher!: number;

  @HasOne(() => EventTable)
  table!: EventTable;

  async getOwner(): Promise<User | null> {
    const [owner] = await this.getParticipants({
      // @ts-ignore - Sequelize types omit 'through' on mixin options
      through: {
        where: {
          isOwner: true,
        },
      },
      limit: 1,
    });

    return owner ?? null;
  }
  public getParticipants!: BelongsToManyGetAssociationsMixin<User>;
  public getAttachments!: HasManyGetAssociationsMixin<Attachment>;
  public getTable!: HasOneGetAssociationMixin<EventTable>;
}
