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
import { AuthGuard } from '@nestjs/passport';
import { FloorplansOverviewDto, UploadFloorplanDto } from '../dto/floorplans-overview.dto';
import { AdminService } from './admin.service';

interface AdminRequestUser {
  adminUser?: {
    eventId?: number;
  };
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('floorplans')
  @UseGuards(AuthGuard('mandatory-admin-cookie'))
  listFloorplans(
    @Req() req: { user?: AdminRequestUser },
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.listFloorplans(this.getEventId(req));
  }

  @Post('floorplans')
  @UseGuards(AuthGuard('mandatory-admin-cookie'))
  uploadFloorplan(
    @Req() req: { user?: AdminRequestUser },
    @Body() body: UploadFloorplanDto,
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.uploadFloorplan(this.getEventId(req), body);
  }

  @Post('floorplans/:filename/activate')
  @UseGuards(AuthGuard('mandatory-admin-cookie'))
  activateFloorplan(
    @Req() req: { user?: AdminRequestUser },
    @Param('filename') filename: string,
  ): Promise<FloorplansOverviewDto> {
    return this.adminService.activateFloorplan(this.getEventId(req), filename);
  }

  private getEventId(req: { user?: AdminRequestUser }): number {
    const eventId = req.user?.adminUser?.eventId;
    if (!eventId) {
      throw new BadRequestException('No event selected');
    }
    return eventId;
  }
}
