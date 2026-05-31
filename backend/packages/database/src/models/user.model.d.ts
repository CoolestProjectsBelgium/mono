import { Event } from './event.model.js';
import { Project } from './project.model.js';
import { Question } from './question.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class User extends BaseEventModel {
    tshirtId: number;
    tshirt: Event;
    project: Project;
    questions: Question[];
    language: string;
    postalcode: number;
    municipality_name: string;
    street: string;
    house_number: string;
    box_number: string;
    email: string;
    firstname: string;
    lastname: string;
    sex: string;
    birthmonth: Date;
    last_token: Date;
    via: string;
    medical: string;
    gsm: string;
    gsm_guardian: string;
    internalinfo: string;
    email_guardian: string;
}
