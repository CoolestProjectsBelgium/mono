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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiCookieAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MandatoryAdminCookieGuard } from '../auth/mandatory-admin-cookie.guard';
import { MulterFile } from '../file-upload/multer-file.type';
import {
  CertificateAssetsOverviewDto,
  ParticipantCertificateStatusDto,
  PreviewCertificateDraftDto,
  PreviewCertificateDraftResponseDto,
} from '../dto/certificate.dto';
import { CertificateService } from './certificate.service';

interface AdminRequestUser {
  adminUser?: {
    eventId?: number;
  };
}

@Controller()
@ApiTags('admin')
@ApiCookieAuth('admin-cookie')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get('admin/certificates/status')
  @UseGuards(MandatoryAdminCookieGuard)
  listStatus(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<ParticipantCertificateStatusDto[]> {
    return this.certificateService.listParticipantStatus(
      this.getEventId(req),
    );
  }

  @Post('admin/certificates/preview')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  async previewDraft(
    @Req() req: { user?: AdminRequestUser },
    @Body() body: PreviewCertificateDraftDto,
  ): Promise<PreviewCertificateDraftResponseDto> {
    const pdf = await this.certificateService.previewCertificateDraft(
      this.getEventId(req),
      body,
    );
    return { pdfBase64: pdf.toString('base64') };
  }

  @Get('admin/certificates/:projectId/:userId/pdf')
  @UseGuards(MandatoryAdminCookieGuard)
  async getPdf(
    @Req() req: { user?: AdminRequestUser },
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, hash, generatedAt } =
      await this.certificateService.getCertificatePdf(
        this.getEventId(req),
        Number(projectId),
        Number(userId),
      );

    res.setHeader('ETag', `"${hash}"`);
    res.setHeader('Last-Modified', generatedAt.toUTCString());
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');
    return file;
  }

  @Get('admin/certificates/assets')
  @UseGuards(MandatoryAdminCookieGuard)
  listAssets(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<CertificateAssetsOverviewDto> {
    return this.certificateService.listCertificateAssets(
      this.getEventId(req),
    );
  }

  @Post('admin/certificates/assets')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @Req() req: { user?: AdminRequestUser },
    @UploadedFile() file: MulterFile,
  ): Promise<CertificateAssetsOverviewDto> {
    return this.certificateService.uploadCertificateAsset(
      this.getEventId(req),
      file,
    );
  }

  @Delete('admin/certificates/assets/:filename')
  @UseGuards(MandatoryAdminCookieGuard)
  @ApiSecurity('csrf')
  deleteAsset(
    @Req() req: { user?: AdminRequestUser },
    @Param('filename') filename: string,
  ): Promise<CertificateAssetsOverviewDto> {
    return this.certificateService.deleteCertificateAsset(
      this.getEventId(req),
      filename,
    );
  }

  private getEventId(req: { user?: AdminRequestUser }): number {
    const eventId = req.user?.adminUser?.eventId;
    if (!eventId) {
      throw new BadRequestException('No event selected');
    }
    return eventId;
  }
}
