import {
  Controller,
  Get,
  Head,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PresentationService } from './presentation.service';
import { PresentationAuthGuard } from '../auth/presentation-auth.guard';
import { Info } from '../info.decorator';
import { InfoDto } from '../dto/info.dto';
import {
  PresentationResolutionsResponseDto,
  SlideListResponseDto,
} from '../dto/slide.dto';
import { DEFAULT_PRESENTATION_RESOLUTION_KEY } from './presentation-resolutions';

@Controller('presentation')
@ApiTags('presentation')
@UseGuards(PresentationAuthGuard)
export class PresentationController {
  constructor(private presentationService: PresentationService) {}

  @Get()
  async listSlides(
    @Info() info: InfoDto,
    @Query('resolution') resolution?: string,
  ): Promise<SlideListResponseDto> {
    return this.presentationService.listSlides(info.currentEvent, resolution);
  }

  // Called by sync-deck.sh once per poll pass so staff can see which Pis are
  // actively checking in (and their last IP) — separate from listSlides so a
  // heartbeat never depends on/blocks on deck-generation logic.
  @Post('heartbeat')
  async heartbeat(@Req() req: Request): Promise<void> {
    const account = req.user as { id: number };
    await this.presentationService.recordCheckin(account.id, req.ip ?? '');
  }

  // Declared before `@Get(':key')`: Nest matches routes in declaration order
  // per HTTP method, so `resolutions` would otherwise be swallowed as
  // `key = 'resolutions'` by the dynamic route below.
  @Get('resolutions')
  getAllowedResolutions(): PresentationResolutionsResponseDto {
    return {
      resolutions: this.presentationService.getAllowedResolutions().map(
        (resolution) => ({ ...resolution }),
      ),
      default: DEFAULT_PRESENTATION_RESOLUTION_KEY,
    };
  }

  @Get(':key')
  async getSlideImage(
    @Info() info: InfoDto,
    @Param('key') key: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('resolution') resolution?: string,
  ) {
    const { file, hash, generatedAt } =
      await this.presentationService.getSlideImage(
        info.currentEvent,
        key,
        resolution,
      );

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
    @Query('resolution') resolution?: string,
  ) {
    const { hash, generatedAt } = await this.presentationService.getSlideMeta(
      info.currentEvent,
      key,
      resolution,
    );

    res.setHeader('ETag', `"${hash}"`);
    if (generatedAt) {
      res.setHeader('Last-Modified', generatedAt.toUTCString());
    }
    res.setHeader('Cache-Control', 'no-cache');
  }
}
