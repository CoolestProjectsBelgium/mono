import { EventDto } from '../dto/event.dto';
import { Event } from '@coolestprojects/database';
export declare class EventService {
    private readonly eventModel;
    constructor(eventModel: typeof Event);
    create(event: EventDto): Promise<Event>;
}
