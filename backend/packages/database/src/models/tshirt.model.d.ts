import { TshirtGroup } from './tshirt_group.model.js';
import { TshirtTranslation } from './tshirt_translation.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Tshirt extends BaseEventModel {
    group: TshirtGroup;
    groupId: number;
    name: string;
    translations: TshirtTranslation[];
}
