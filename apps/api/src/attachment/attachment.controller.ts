import {
  Controller,
  Body,
  Post,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { UpdateAttachmentDto } from '../dto/update-attachment.dto';
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
    @Request() req: { user: { id: number } },
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
    @Request() req: { user: { id: number } },
    @Param('name') name: string,
  ): Promise<SASToken> {
    return this.attachmentService.getAttachmentSAS(name, req.user.id);
  }

  @Post(':name/poster')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async ensurePoster(
    @Request() req: { user: { id: number } },
    @Param('name') name: string,
  ): Promise<void> {
    return this.attachmentService.ensureVideoPoster(name, req.user.id);
  }

  @Post(':name/normalize')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async normalizeVideo(
    @Request() req: { user: { id: number } },
    @Param('name') name: string,
  ): Promise<void> {
    return this.attachmentService.normalizeVideo(name, req.user.id);
  }

  @Patch(':name')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async updateAttachment(
    @Request() req: { user: { id: number } },
    @Param('name') name: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<void> {
    return this.attachmentService.updateAttachmentName(
      name,
      req.user.id,
      updateAttachmentDto,
    );
  }

  @Delete(':name')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  async deleteAttachment(
    @Request() req: { user: { id: number } },
    @Param('name') name: string,
  ): Promise<void> {
    return this.attachmentService.deleteAttachment(name, req.user.id);
  }
}
