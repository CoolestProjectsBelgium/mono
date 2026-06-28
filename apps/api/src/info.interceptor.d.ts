import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Event } from '@coolestprojects/database';
export declare class InfoInterceptor implements NestInterceptor {
    private readonly eventModel;
    constructor(eventModel: typeof Event);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
