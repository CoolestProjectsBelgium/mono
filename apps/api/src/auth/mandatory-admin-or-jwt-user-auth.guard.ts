import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MandatoryAdminOrJwtUserAuthGuard extends AuthGuard([
  'mandatory-admin-cookie',
  'jwt-user',
]) {}
