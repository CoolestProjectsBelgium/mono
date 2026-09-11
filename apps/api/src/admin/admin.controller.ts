import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FloorplansOverviewDto, UploadFloorplanDto } from '../dto/floorplans-overview.dto';
import { MailTemplateContextRequestDto } from '../dto/mail-template-context.dto';
import { UploadPresentationSlideImageDto } from '../dto/upload-presentation-slide-image.dto';
import {
  PresentationAssetsOverviewDto,
  UploadPresentationAssetDto,
} from '../dto/presentation-assets.dto';
import { PreviewPresentationSlideDraftDto } from '../dto/presentation-preview.dto';
import { SlideListResponseDto } from '../dto/slide.dto';
import { AdminService } from './admin.service';
import { MandatoryAdminCookieGuard } from '../auth/mandatory-admin-cookie.guard';

interface AdminRequestUser {
  adminUser?: {
    eventId?: number;
  };
}

@Controller('admin')
@ApiTags('admin')
@ApiCookieAuth('admin-cookie')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('floorplans')
  @UseGuards(MandatoryAdminCookieGuard)
  listFloorplans(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.listFloorplans(this.getEventId(req));
  }

  @Post('floorplans')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  uploadFloorplan(
    @Req() req: { user?: AdminRequestUser },
    @Body() body: UploadFloorplanDto,
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.uploadFloorplan(this.getEventId(req), body);
  }

  @Post('floorplans/:filename/activate')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  activateFloorplan(
    @Req() req: { user?: AdminRequestUser },
    @Param('filename') filename: string,
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.activateFloorplan(this.getEventId(req), filename);
  }

  @Post('mail-templates/context')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  getMailTemplateContext(
    @Body() body: MailTemplateContextRequestDto,
  ): Promise<Record<string, unknown>> {
    return this.adminService.getMailTemplateContext(body);
  }

  @Post('presentation-slides/:id/image')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  uploadPresentationSlideImage(
    @Req() req: { user?: AdminRequestUser },
    @Param('id') id: string,
    @Body() body: UploadPresentationSlideImageDto,
  ): Promise<void> {
    return this.adminService.uploadPresentationSlideImage(
      this.getEventId(req),
      Number(id),
      body,
    );
  }

  @Get('presentation-assets')
  @UseGuards(MandatoryAdminCookieGuard)
  listPresentationAssets(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<PresentationAssetsOverviewDto> {
    return this.adminService.listPresentationAssets(this.getEventId(req));
  }

  @Post('presentation-assets')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  uploadPresentationAsset(
    @Req() req: { user?: AdminRequestUser },
    @Body() body: UploadPresentationAssetDto,
  ): Promise<PresentationAssetsOverviewDto> {
    return this.adminService.uploadPresentationAsset(this.getEventId(req), body);
  }

  @Delete('presentation-assets/:filename')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  deletePresentationAsset(
    @Req() req: { user?: AdminRequestUser },
    @Param('filename') filename: string,
  ): Promise<PresentationAssetsOverviewDto> {
    return this.adminService.deletePresentationAsset(this.getEventId(req), filename);
  }

  @Get('presentation-slides/preview')
  @UseGuards(MandatoryAdminCookieGuard)
  listPresentationSlides(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<SlideListResponseDto> {
    return this.adminService.listPresentationSlides(this.getEventId(req));
  }

  @Get('presentation-slides/preview/projects')
  @UseGuards(MandatoryAdminCookieGuard)
  listPresentationPreviewProjects(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<{ id: number; name: string }[]> {
    return this.adminService.listPresentationPreviewProjects(this.getEventId(req));
  }

  @Get('presentation-slides/preview/:key/image')
  @UseGuards(MandatoryAdminCookieGuard)
  async getPresentationSlideImage(
    @Req() req: { user?: AdminRequestUser },
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, hash, generatedAt } = await this.adminService.getPresentationSlideImage(
      this.getEventId(req),
      key,
    );

    res.setHeader('ETag', `"${hash}"`);
    res.setHeader('Last-Modified', generatedAt.toUTCString());
    res.setHeader('Cache-Control', 'no-cache');
    return file;
  }

  @Post('presentation-slides/preview/draft')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  previewPresentationSlideDraft(
    @Req() req: { user?: AdminRequestUser },
    @Body() body: PreviewPresentationSlideDraftDto,
  ): Promise<{ imageBase64: string }> {
    return this.adminService.previewPresentationSlideDraft(this.getEventId(req), body);
  }

  private getEventId(req: { user?: AdminRequestUser }): number {
    const eventId = req.user?.adminUser?.eventId;
    if (!eventId) {
      throw new BadRequestException('No event selected');
    }
    return eventId;
  }
}
