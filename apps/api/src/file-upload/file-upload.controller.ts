import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, UseGuards, UseInterceptors, Request } from '@nestjs/common';

@Controller('file')
@ApiTags('file')
@ApiCookieAuth()
export class FileUploadController {
  constructor() { }

  @Get('auth/check')
  @UseGuards(AuthGuard('filesign')) // signature is already valid
  async checkFileAccessAllowed(@Request() req: any) {
    return { ok: true };
  }
}
