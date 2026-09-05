import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EventguideProjectsResponseDto } from '../dto/eventguide-project.dto';
import { EventguideService } from './eventguide.service';

@Controller('eventguide')
export class EventguideController {
  constructor(private readonly eventguideService: EventguideService) {}

  @Get('projects')
  getCurrentEventProjects(@Req() req: { info?: { currentEvent: number } }): Promise<EventguideProjectsResponseDto> {
    const eventId = req.info?.currentEvent;
    if (!eventId || eventId < 0) {
      throw new NotFoundException('No active event');
    }

    return this.eventguideService.getProjects(eventId);
  }

  @Get('events/:eventId/projects')
  getEventProjects(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventguideProjectsResponseDto> {
    return this.eventguideService.getProjects(eventId);
  }

  @Get('floorplans/:filename')
  async getFloorplan(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.eventguideService.getFloorplan(filename);
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    return file;
  }

  @Get('attachments/:attachmentId/thumbnail')
  async getAttachmentThumbnail(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.eventguideService.getThumbnailByAttachmentId(attachmentId);
    res.setHeader('Cache-Control', 'public, max-age=300');
    return file;
  }
}
