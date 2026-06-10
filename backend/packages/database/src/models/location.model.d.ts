import { EventTable } from './event_table.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Location extends BaseEventModel {
    tables: EventTable[];
    text: string;
}
