import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Param,
  Body,
  UseGuards,
  Query,
  Inject
} from '@nestjs/common';

import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-voting-auth.guard';
import { LocalAuthGuard } from '../auth/local-voting-auth.guard';
import { ProjectVoteDto } from '../dto/projectvote.dto';
import { VotingService } from './voting.service';
import { JwtService } from '@nestjs/jwt';
import { VOTING_JWT } from '../auth/auth.module';

@Controller()
export class VotingController {
  constructor(private votingService: VotingService, @Inject(VOTING_JWT) private readonly votingJwtService: JwtService) { }

  @Post('auth/login')
  @UseGuards(LocalAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    return res.send();
  }

  @Get('auth/user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<AccountDto> {
    const account = await this.votingService.getAccount(req.user.id);
    return account
  }

  @Get('languages')
  @UseGuards(JwtAuthGuard)
  async languages() {
    return [
      { id: 'nl', text: 'Dutch' },
      { id: 'fr', text: 'French' },
      { id: 'en', text: 'English' },
    ];
  }

  @Get('projects')
  @UseGuards(JwtAuthGuard)
  async getProjects(@Req() req: any, @Query() query: any): Promise<ProjectVoteDto | VoteMessage> {

    let languages = ['nl', 'fr', 'en'];
    try {
      languages = JSON.parse(query.languages);
    } catch { }

    let skipProjectId = null;
    try {
      skipProjectId = JSON.parse(query.skipProject);
    } catch { }

    return await this.votingService.getProjects(skipProjectId, languages, req.user.id)
  }

  @Post('projects/:projectId')
  @UseGuards(JwtAuthGuard)
  async submitVotes(
    @Req() req: any,
    @Param('projectId') projectId: number,
    @Body() body: any[],
  ) {
    const votes = body.map((v) => ({
      id: v.id,
      value: v.value || 0
    }));
    await this.votingService.submitVotes(projectId, req.user.id, votes)
  }
}