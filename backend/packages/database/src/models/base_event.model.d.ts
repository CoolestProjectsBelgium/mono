import { Model } from 'sequelize-typescript';
import { Event } from './event.model.js';
export declare class BaseEventModel extends Model {
    eventId: number;
    event: Event;
    static setAdminEventScopes(eventId: number[], scopeprefix?: string): void;
}
