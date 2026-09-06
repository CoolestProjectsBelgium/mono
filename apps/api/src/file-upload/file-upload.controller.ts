import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { FilesignAuthGuard } from '../auth/filesign-auth.guard';

@Controller('file')
@ApiTags('file')
export class FileUploadController {
  constructor() { }

  @Get('auth/check')
  @UseGuards(FilesignAuthGuard) // signature is already valid
  async checkFileAccessAllowed(@Request() req: any) {
    return { ok: true };
  }
}
