import {
  Controller,
  Body,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { SASToken } from '../dto/sas-token.dto';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

@Controller('attachments')
@ApiTags('attachments')
@ApiCookieAuth()
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async createAttachment(
    @Request() req,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<SASToken> {
    return this.attachmentService.createAttachment(
      createAttachmentDto,
      req.user.id,
    );
  }

  @Post(':name/sas')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async createSASToken(
    @Request() req,
    @Param('name') name: string,
  ): Promise<SASToken> {
    return this.attachmentService.getAttachmentSAS(name, req.user.id);
  }

  @Delete(':name')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async deleteAttachment(
    @Request() req,
    @Param('name') name: string,
  ): Promise<void> {
    return this.attachmentService.deleteAttachment(name, req.user.id);
  }
}
