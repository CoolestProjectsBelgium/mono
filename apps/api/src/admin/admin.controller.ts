import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FloorplansOverviewDto, UploadFloorplanDto } from '../dto/floorplans-overview.dto';
import { MailTemplateContextRequestDto } from '../dto/mail-template-context.dto';
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

  private getEventId(req: { user?: AdminRequestUser }): number {
    const eventId = req.user?.adminUser?.eventId;
    if (!eventId) {
      throw new BadRequestException('No event selected');
    }
    return eventId;
  }
}
