import { TshirtGroup } from './tshirt_group.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class TshirtGroupTranslation extends BaseEventModel {
    language: string;
    description: string;
    group: TshirtGroup;
    groupId: number;
}
