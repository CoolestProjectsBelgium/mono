import { Project } from './project.model.js';
import { Account } from './account.model.js';
import { VoteCategory } from './vote_category.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Vote extends BaseEventModel {
    projectId: number;
    project: Project;
    acccount: Account;
    accountId: number;
    category: VoteCategory;
    categoryId: number;
}
