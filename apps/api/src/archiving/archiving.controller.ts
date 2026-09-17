import {
  BadRequestException,
  Controller,
  Get,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { MandatoryAdminCookieGuard } from '../auth/mandatory-admin-cookie.guard';
import { EventguideService } from '../eventguide/eventguide.service';

interface AdminRequestUser {
  adminUser?: {
    eventId?: number;
  };
}

/** Admin-only static exports of event data — currently just the eventguide project archive; see EventguideService for the underlying data/rendering, kept in line with the public eventguide endpoints. */
@Controller('archiving')
export class ArchivingController {
  constructor(private readonly eventguideService: EventguideService) {}

  @Get('projects')
  @UseGuards(MandatoryAdminCookieGuard)
  async downloadProjectsArchive(
    @Req() req: { user?: AdminRequestUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const eventId = this.getEventId(req);
    const html = await this.eventguideService.getProjectsArchiveHtml(eventId);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-${eventId}-archive.html"`,
    );
    return new StreamableFile(html);
  }

  private getEventId(req: { user?: AdminRequestUser }): number {
    const eventId = req.user?.adminUser?.eventId;
    if (!eventId) {
      throw new BadRequestException('No event selected');
    }
    return eventId;
  }
}
