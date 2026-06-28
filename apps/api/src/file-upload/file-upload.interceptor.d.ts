import { ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class FileUploadInterceptor implements NestInterceptor {
    private fieldName;
    private readonly fileInterceptor;
    constructor(fieldName: string);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
