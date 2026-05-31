import { Event } from './event.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class QuestionTranslation extends BaseEventModel {
    language: string;
    questionId: number;
    description: string;
    positive: string;
    negative: string;
    question: Event;
}
