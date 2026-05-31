import { Location } from './location.model.js';
import { BaseEventModel } from './base_event.model.js';
export declare class EventTable extends BaseEventModel {
    table: EventTable;
    name: string;
    requirements: string;
    maxPlaces: number;
    locationId: number;
    location: Location;
}
