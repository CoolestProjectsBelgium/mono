import { Project } from './project.model.js';
import { EventTable } from './event_table.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class ProjectTable extends BaseEventModel {
    projectId: number;
    project: Project;
    tableId: number;
    table: EventTable;
}
