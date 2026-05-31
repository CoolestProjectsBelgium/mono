import { Event } from './event.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class TshirtGroupTranslation extends BaseEventModel {
    language: string;
    description: string;
    group: Event;
    groupId: number;
}
