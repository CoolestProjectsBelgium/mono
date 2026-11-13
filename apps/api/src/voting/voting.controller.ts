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
  UseGuards,
} from '@nestjs/common';

import { Sse, MessageEvent } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtVotingAuthGuard } from '../auth/jwt-voting-auth.guard';
import { VotingLoginAuthGuard } from '../auth/local-voting-auth.guard';
import { VOTING_JWT } from '../auth/auth.module';
import {
  requireAdminEventId,
  type AdminRequest,
  type JuryRequest,
} from '../auth/request-user';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { AccountDto } from '../dto/account.dto';
import { VoteMessage } from '../dto/votemessage.dto';
import { VotingService } from './voting.service';
import { VotingEvent } from '../dto/votingevent.dto';
import { Observable, map } from 'rxjs';
import { MandatoryAdminCookieGuard } from '../auth/mandatory-admin-cookie.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

const VOTING_LANGUAGES = ['nl', 'fr', 'en'];

/** `languages` is a JSON array in the query string; anything unusable falls back to all languages. */
export function parseLanguagesQuery(raw: unknown): string[] {
  try {
    const parsed: unknown = JSON.parse(String(raw));
    if (Array.isArray(parsed)) {
      const known = parsed.filter(
        (language): language is string =>
          typeof language === 'string' && VOTING_LANGUAGES.includes(language),
      );
      if (known.length > 0) {
        return known;
      }
    }
  } catch {
    // not JSON — use the default below
  }
  return [...VOTING_LANGUAGES];
}

/** `skipProject` is a JSON number in the query string; anything else means "skip nothing". */
export function parseSkipProjectQuery(raw: unknown): number | null {
  try {
    const parsed: unknown = JSON.parse(String(raw));
    return typeof parsed === 'number' && Number.isInteger(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

@Controller()
@ApiTags('voting')
export class VotingController {
  constructor(
    private votingService: VotingService,
    @Inject(VOTING_JWT) private readonly votingJwtService: JwtService,
  ) {}

  @Post()
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  receiveEvent(@Body() event: VotingEvent) {
    this.votingService.publish(event);
    return { success: true };
  }

  @Post('admin/voting/start')
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  async startVoting(
    @Req() req: AdminRequest,
    @Body() body: { durationMinutes?: number; deletePreviousResults?: boolean },
  ) {
    await this.votingService.openVotingWithDuration(
      requireAdminEventId(req),
      Number(body.durationMinutes ?? 60),
      body.deletePreviousResults === true,
    );
    return { success: true };
  }

  @Post('admin/voting/stop')
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  async stopVoting(@Req() req: AdminRequest) {
    await this.votingService.closeVotingNow(requireAdminEventId(req));
    const awards = await this.votingService.generateAwards(
      requireAdminEventId(req),
    );
    return { success: true, awards };
  }

  @Post('admin/voting/message')
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  sendAdminMessage(
    @Req() req: AdminRequest,
    @Body() body: { message?: string },
  ) {
    this.votingService.publishMessage(String(body.message ?? ''));
    return { success: true };
  }

  @Get('admin/voting/results')
  @ApiCookieAuth('admin-cookie')
  @UseGuards(MandatoryAdminCookieGuard)
  getVotingResults(@Req() req: AdminRequest) {
    return this.votingService.calculateVotes(requireAdminEventId(req));
  }

  @Post('admin/voting/awards/generate')
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  async generateAwards(@Req() req: AdminRequest) {
    return this.votingService.generateAwards(requireAdminEventId(req));
  }

  @Get('admin/voting/awards')
  @ApiCookieAuth('admin-cookie')
  @UseGuards(MandatoryAdminCookieGuard)
  async getAwards(@Req() req: AdminRequest) {
    return this.votingService.getAwardAssignments(requireAdminEventId(req));
  }

  @Post('admin/voting/awards/:awardId/assign')
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(MandatoryAdminCookieGuard)
  async assignAward(
    @Req() req: AdminRequest,
    @Param('awardId') awardId: number,
    @Body() body: { categoryId?: number | null },
  ) {
    await this.votingService.assignAward(
      requireAdminEventId(req),
      Number(awardId),
      body.categoryId === null || body.categoryId === undefined
        ? null
        : Number(body.categoryId),
    );
    return { success: true };
  }

  @Get('admin/voting/status')
  @ApiCookieAuth('admin-cookie')
  @UseGuards(MandatoryAdminCookieGuard)
  async getVotingStatus(@Req() req: AdminRequest) {
    const event = await this.votingService.getVotingStatus(
      requireAdminEventId(req),
    );
    return event;
  }

  @Sse('sse')
  @ApiBearerAuth('jwt-voting')
  @UseGuards(JwtVotingAuthGuard)
  sse(): Observable<MessageEvent> {
    return this.votingService.stream().pipe(
      map((event): MessageEvent => ({
        type: event.type,
        data: JSON.stringify({
          type: event.type,
          message: event.message,
          startDate: event.startDate
            ? new Date(event.startDate).toISOString()
            : undefined,
          endDate: event.endDate
            ? new Date(event.endDate).toISOString()
            : undefined,
        }),
      })),
    );
  }

  @Post('auth/login')
  @ApiSecurity('csrf')
  // ThrottlerGuard first so a brute-force burst is rejected before
  // VotingLoginAuthGuard ever runs the bcrypt/DB credential check.
  @UseGuards(ThrottlerGuard, VotingLoginAuthGuard)
  // Password login for a small, fixed set of jury accounts — throttle
  // tighter than the module default against brute force (see
  // security-assessment-2026-09.md H1, endpoint inventory "jury brute force").
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Req() req: JuryRequest, @Res() res: Response) {
    const account = await this.votingService.getAccount(req.user.id);
    if (!account) return res.status(403).send();

    const token = this.votingJwtService.sign(
      { id: account.id, email: account.email, eventId: account.eventId },
      { expiresIn: '12h' },
    );

    return res.status(200).json({ jwt: token });
  }

  @Post('auth/logout')
  @ApiBearerAuth('jwt-voting')
  @ApiSecurity('csrf')
  @UseGuards(JwtVotingAuthGuard)
  async logout(@Res() res: Response) {
    return res.send();
  }

  @Get('auth/user')
  @ApiBearerAuth('jwt-voting')
  @UseGuards(JwtVotingAuthGuard)
  async getUser(@Req() req: JuryRequest): Promise<AccountDto> {
    const account = await this.votingService.getAccount(req.user.id);
    return account;
  }

  @Get('languages')
  @ApiBearerAuth('jwt-voting')
  @UseGuards(JwtVotingAuthGuard)
  async languages() {
    return [
      { id: 'nl', text: 'Dutch' },
      { id: 'fr', text: 'French' },
      { id: 'en', text: 'English' },
    ];
  }

  @Get('projects')
  @ApiBearerAuth('jwt-voting')
  @UseGuards(JwtVotingAuthGuard)
  async getProjects(
    @Req() req: JuryRequest,
    @Query() query: { languages?: unknown; skipProject?: unknown },
  ): Promise<ProjectVoteDto | VoteMessage> {
    const languages = parseLanguagesQuery(query.languages);
    const skipProjectId = parseSkipProjectQuery(query.skipProject);

    return await this.votingService.getProjects(
      req.user.eventId,
      skipProjectId,
      languages,
      req.user.id,
    );
  }

  @Post('projects/:projectId')
  @ApiBearerAuth('jwt-voting')
  @ApiSecurity('csrf')
  @UseGuards(JwtVotingAuthGuard)
  async submitVotes(
    @Req() req: JuryRequest,
    @Param('projectId') projectId: number,
    @Body() body: Array<{ id: number; value?: number }>,
  ) {
    const votes = body.map((v) => ({
      id: v.id,
      value: v.value || 0,
    }));
    await this.votingService.submitVotes(
      req.user.eventId,
      projectId,
      req.user.id,
      votes,
    );
  }
}
