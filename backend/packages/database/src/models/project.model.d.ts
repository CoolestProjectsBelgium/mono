import { User } from './user.model.js';
import { BaseEventModel } from './base_event.model.js';
import { BelongsToGetAssociationMixin, BelongsToManyGetAssociationsMixin } from 'sequelize';
export declare class Project extends BaseEventModel {
    ownerId: number;
    owner: User;
    name: string;
    description: string;
    type: string;
    internalInformation: string;
    language: string;
    participants: User[];
    maxVoucher: number;
    getOwner: BelongsToGetAssociationMixin<User>;
    getParticipants: BelongsToManyGetAssociationsMixin<User>;
}
