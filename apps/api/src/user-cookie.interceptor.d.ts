import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokensService } from './tokens/tokens.service';
export declare class UserCookieInterceptor implements NestInterceptor {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
