import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';

import { Sse, MessageEvent } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { VOTING_JWT } from '../auth/auth.module';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { VotingService } from './voting.service';
import { VotingEvent } from '../dto/votingevent.dto';
import { Observable, map } from 'rxjs';

@Controller()
export class VotingController {
  constructor(private votingService: VotingService, @Inject(VOTING_JWT) private readonly votingJwtService: JwtService) { }

  @Post()
  @UseGuards(AuthGuard('mandatory-admin-cookie'))
  receiveEvent(@Body() event: VotingEvent) {
    this.votingService.publish(event);
    return { success: true };
  }

  @Sse('sse')
  @UseGuards(AuthGuard('jwt-voting'))
  sse(): Observable<MessageEvent> {
    return this.votingService.stream().pipe(
      map((event): MessageEvent => ({
        type: event.type,
        data: event,
      })),
    );
  }

  @Post('auth/login')
  @UseGuards(AuthGuard('login-voting'))
  async login(@Req() req: any, @Res() res: Response) {
    console.log('user:', req.user);

    
    const account = await this.votingService.getAccount(req.user.id);
    if (!account) return res.status(403).send();

    const token = this.votingJwtService.sign(
      { id: account.id, email: account.email },
      { expiresIn: '12h' },
    );

    return res.status(200).json({ jwt: token });
  }

  @Post('auth/logout')
  @UseGuards(AuthGuard('jwt-voting'))
  async logout(@Res() res: Response) {
    return res.send();
  }

  @Get('auth/user')
  @UseGuards(AuthGuard('jwt-voting'))
  async getUser(@Req() req: any): Promise<AccountDto> {
    const account = await this.votingService.getAccount(req.user.id);
    return account
  }

  @Get('languages')
  @UseGuards(AuthGuard('jwt-voting'))
  async languages() {
    return [
      { id: 'nl', text: 'Dutch' },
      { id: 'fr', text: 'French' },
      { id: 'en', text: 'English' },
    ];
  }

  @Get('projects')
  @UseGuards(AuthGuard('jwt-voting'))
  async getProjects(@Req() req: any, @Query() query: any): Promise<ProjectVoteDto | VoteMessage> {

    let languages = ['nl', 'fr', 'en'];
    try {
      languages = JSON.parse(query.languages);
    } catch { }

    let skipProjectId = null;
    try {
      skipProjectId = JSON.parse(query.skipProject);
    } catch { }

    return await this.votingService.getProjects(req.user.eventId, skipProjectId, languages, req.user.id)
  }

  @Post('projects/:projectId')
  @UseGuards(AuthGuard('jwt-voting'))
  async submitVotes(
    @Req() req: any,
    @Param('projectId') projectId: number,
    @Body() body: any[],
  ) {
    const votes = body.map((v) => ({
      id: v.id,
      value: v.value || 0
    }));
    await this.votingService.submitVotes(req.user.eventId, projectId, req.user.id, votes)
  }
}