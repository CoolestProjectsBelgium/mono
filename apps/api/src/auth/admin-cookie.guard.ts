import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminCookieGuard extends AuthGuard('mandatory-admin-cookie') {}
