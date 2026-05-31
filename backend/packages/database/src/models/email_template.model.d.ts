import { BaseEventModel } from './base_event.model.js';
export declare class EmailTemplate extends BaseEventModel {
    id: number;
    template: string;
    language: string;
    subject: string;
    contentPlain: string;
    contentRich: string;
}
