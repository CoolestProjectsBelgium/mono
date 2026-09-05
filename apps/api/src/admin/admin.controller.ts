import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Body } from '@nestjs/common';
import { OtherProjectDto } from '../dto/other-project.dto';
import { AdminService } from './admin.service';
import { AdminCookieGuard } from '../auth/admin-cookie.guard';

@Controller('participant')
@ApiTags('participant')
@ApiCookieAuth()
export class AdminController {
  constructor(
      private adminService: AdminService,
    ) { }

  @Get()
  @UseGuards(AdminCookieGuard)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getListContext(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.adminService.getListContext(req.user.id);
  }

  @Get()
  @UseGuards(AdminCookieGuard)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getMailContext(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.adminService.getMailContext(req.user.id);
  }
  
}
