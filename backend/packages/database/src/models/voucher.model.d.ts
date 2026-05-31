import { Project } from './project.model.js';
import { User } from './user.model.js';
import { BaseEventModel } from './base_event.model.js';
import { BelongsToGetAssociationMixin } from 'sequelize';
export declare class Voucher extends BaseEventModel {
    id: number;
    projectId: number;
    project: Project;
    participantId: number;
    participant: User;
    voucherGuid: string;
    getProject: BelongsToGetAssociationMixin<Project>;
}
