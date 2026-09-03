import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class VotingLoginAuthGuard extends AuthGuard('login-voting') {}
