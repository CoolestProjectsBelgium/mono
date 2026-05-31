import { User } from './user.model.js';
import { Registration } from './registration.model.js';
import { QuestionTranslation } from './question_translation.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class Question extends BaseEventModel {
    name: string;
    mandatory: boolean;
    users: User[];
    registrations: Registration[];
    translations: QuestionTranslation[];
}
