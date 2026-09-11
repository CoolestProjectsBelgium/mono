import {
  Controller,
  Get,
  Head,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PresentationService } from './presentation.service';
import { PresentationAuthGuard } from '../auth/presentation-auth.guard';
import { Info } from '../info.decorator';
import { InfoDto } from '../dto/info.dto';
import { SlideListResponseDto } from '../dto/slide.dto';

@Controller('presentation')
@ApiTags('presentation')
@UseGuards(PresentationAuthGuard)
export class PresentationController {
  constructor(private presentationService: PresentationService) {}

  @Get()
  async listSlides(@Info() info: InfoDto): Promise<SlideListResponseDto> {
    return this.presentationService.listSlides(info.currentEvent);
  }

  @Get(':key')
  async getSlideImage(
    @Info() info: InfoDto,
    @Param('key') key: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { file, hash, generatedAt } =
      await this.presentationService.getSlideImage(info.currentEvent, key);

    const etag = `"${hash}"`;
    if (req.headers['if-none-match'] === etag) {
      res.status(304);
      return;
    }

    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', generatedAt.toUTCString());
    res.setHeader('Cache-Control', 'no-cache');
    return file;
  }

  // Deliberately not left to Express's auto-derived HEAD-from-GET: that would
  // run the full render-if-stale path just to answer a HEAD request. This
  // calls the hash-only lookup instead, so a HEAD never triggers Puppeteer.
  @Head(':key')
  async getSlideMeta(
    @Info() info: InfoDto,
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { hash, generatedAt } = await this.presentationService.getSlideMeta(
      info.currentEvent,
      key,
    );

    res.setHeader('ETag', `"${hash}"`);
    if (generatedAt) {
      res.setHeader('Last-Modified', generatedAt.toUTCString());
    }
    res.setHeader('Cache-Control', 'no-cache');
  }
}
