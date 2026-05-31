import { BaseEventModel } from './base_event.model.js';
export declare class VoteCategory extends BaseEventModel {
    name: string;
    min: number;
    max: number;
    public: boolean;
    optional: boolean;
}
