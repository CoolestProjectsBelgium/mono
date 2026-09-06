import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MandatoryAdminCookieGuard extends AuthGuard('mandatory-admin-cookie') {}