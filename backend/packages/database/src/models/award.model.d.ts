import { Project } from './project.model.js';
import { VoteCategory } from './vote_category.model.js';
import { Account } from './account.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Award extends BaseEventModel {
    projectId: number;
    project: Project;
    categoryId: number;
    category: VoteCategory;
    jurorId: number;
    juror: Account;
}
