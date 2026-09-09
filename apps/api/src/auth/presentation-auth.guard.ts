import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PresentationAuthGuard extends AuthGuard('presentation-basic') {}
