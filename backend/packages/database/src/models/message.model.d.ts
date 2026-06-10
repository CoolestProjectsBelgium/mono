import { BaseEventModel } from './base_event.model.js';
export declare class Message extends BaseEventModel {
    message: string;
    startAt: Date;
    endAt: Date;
}
