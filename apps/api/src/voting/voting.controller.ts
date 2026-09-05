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
import { JwtVotingAuthGuard } from '../auth/jwt-voting-auth.guard';
import { VotingLoginAuthGuard } from '../auth/local-voting-auth.guard';
import { VOTING_JWT } from '../auth/auth.module';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { AccountDto } from '../dto/account.dto';
import { VoteMessage } from '../dto/votemessage.dto';
import { VotingService } from './voting.service';
import { VotingEvent } from '../dto/votingevent.dto';
import { Observable, map } from 'rxjs';
import { UnauthorizedException } from '@nestjs/common';

@Controller()
export class VotingController {
  constructor(private votingService: VotingService, @Inject(VOTING_JWT) private readonly votingJwtService: JwtService) { }

  private getAdminEventId(req: any): number {
    const internalSecret = req.headers?.['x-adminjs-secret'];
    const internalEventId = Number(req.headers?.['x-adminjs-event-id']);
    if (internalSecret && internalSecret === process.env.ADMINJS_COOKIE_SECRET
      && Number.isInteger(internalEventId) && internalEventId > 0) {
      return internalEventId;
    }

    const eventId = Number(req.user?.adminUser?.eventId ?? req.user?.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw new UnauthorizedException('No Event selected for admin account');
    }
    return eventId;
  }

  @Post()
  @UseGuards(AuthGuard('mandatory-admin-cookie'))
  receiveEvent(@Body() event: VotingEvent) {
    this.votingService.publish(event);
    return { success: true };
  }

  @Post('admin/voting/start')
  async startVoting(@Req() req: any, @Body() body: { durationMinutes?: number; deletePreviousResults?: boolean }) {
    const eventId = this.getAdminEventId(req);
    await this.votingService.openVotingWithDuration(
      eventId,
      Number(body.durationMinutes ?? 60),
      body.deletePreviousResults === true,
    );
    return { success: true };
  }

  @Post('admin/voting/stop')
  async stopVoting(@Req() req: any) {
    const eventId = this.getAdminEventId(req);
    await this.votingService.closeVotingNow(eventId);
    const awards = await this.votingService.generateAwards(eventId);
    return { success: true, awards };
  }

  @Post('admin/voting/message')
  sendAdminMessage(@Req() req: any, @Body() body: { message?: string }) {
    this.getAdminEventId(req);
    this.votingService.publishMessage(String(body.message ?? ''));
    return { success: true };
  }

  @Get('admin/voting/results')
  getVotingResults(@Req() req: any) {
    return this.votingService.calculateVotes(this.getAdminEventId(req));
  }

  @Post('admin/voting/awards/generate')
  async generateAwards(@Req() req: any) {
    return this.votingService.generateAwards(this.getAdminEventId(req));
  }


  @Get('admin/voting/awards')
  async getAwards(@Req() req: any) {
    return this.votingService.getAwardAssignments(this.getAdminEventId(req));
  }

  @Post('admin/voting/awards/:awardId/assign')
  async assignAward(
    @Req() req: any,
    @Param('awardId') awardId: number,
    @Body() body: { categoryId?: number | null },
  ) {
    await this.votingService.assignAward(
      this.getAdminEventId(req),
      Number(awardId),
      body.categoryId === null || body.categoryId === undefined ? null : Number(body.categoryId),
    );
    return { success: true };
  }

  @Get('admin/voting/status')
  async getVotingStatus(@Req() req: any) {
    const event = await this.votingService.getVotingStatus(this.getAdminEventId(req));
    return event;
  }

  @Sse('sse')
  @UseGuards(JwtVotingAuthGuard)
  sse(): Observable<MessageEvent> {
    return this.votingService.stream().pipe(
      map((event): MessageEvent => ({
        type: event.type,
        data: JSON.stringify({
          type: event.type,
          message: event.message,
          startDate: event.startDate ? new Date(event.startDate).toISOString() : undefined,
          endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
        }),
      })),
    );
  }

  @Post('auth/login')
  @UseGuards(VotingLoginAuthGuard)
  async login(@Req() req: any, @Res() res: Response) {
    console.log('user:', req.user);

    const account = await this.votingService.getAccount(req.user.id);
    if (!account) return res.status(403).send();

    const token = this.votingJwtService.sign(
      { id: account.id, email: account.email, eventId: account.eventId },
      { expiresIn: '12h' },
    );

    return res.status(200).json({ jwt: token });
  }

  @Post('auth/logout')
  @UseGuards(JwtVotingAuthGuard)
  async logout(@Res() res: Response) {
    return res.send();
  }

  @Get('auth/user')
  @UseGuards(JwtVotingAuthGuard)
  async getUser(@Req() req: any): Promise<AccountDto> {
    const account = await this.votingService.getAccount(req.user.id);
    return account
  }

  @Get('languages')
  @UseGuards(JwtVotingAuthGuard)
  async languages() {
    return [
      { id: 'nl', text: 'Dutch' },
      { id: 'fr', text: 'French' },
      { id: 'en', text: 'English' },
    ];
  }

  @Get('projects')
  @UseGuards(JwtVotingAuthGuard)
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
  @UseGuards(JwtVotingAuthGuard)
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