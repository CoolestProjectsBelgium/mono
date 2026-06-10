import { Project } from './project.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Certificate extends BaseEventModel {
    text: string;
    projectId: number;
    project: Project;
}
