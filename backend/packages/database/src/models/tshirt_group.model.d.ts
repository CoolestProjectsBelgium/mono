import { TshirtGroupTranslation } from './tshirt_group_translation.model.js';
import { Tshirt } from './tshirt.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class TshirtGroup extends BaseEventModel {
    translations: TshirtGroupTranslation[];
    tshirts: Tshirt[];
    name: string;
}
