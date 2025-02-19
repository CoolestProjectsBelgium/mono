import {
  Controller,
  Body,
  Post,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AzureBlobService } from '../azureblob/azureblob.service';
import { AttachmentDto } from '../dto/attachment.dto';
import { SASToken } from '../dto/sas-token.dto';
import { Readable } from 'stream';
import { InfoDto } from '../dto/info.dto';
import { Info } from '../info.decorator';
import { Event } from '../models/event.model';
import { FileUploadInterceptor } from '../file-upload/file-upload.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('attachment')
@ApiTags('attachment')
@ApiCookieAuth()
export class AttachmentController {
  constructor(private readonly azureBlobService: AzureBlobService) {}

  @Post('stream')
  @UseInterceptors(new FileUploadInterceptor('file'))
  async uploadFile(@Info() info: InfoDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'File is required and must be within the size limit',
      );
    }
    const event = await Event.findByPk(info.currentEvent, {
      attributes: ['azure_storage_container'],
    });

    const containerName = event.azure_storage_container;
    const fileStream = Readable.from(file.buffer);
    const blobUrl = await this.azureBlobService.uploadStreamToAzure(
      containerName,
      fileStream,
      file.originalname,
    );

    return null;
  }

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createAttachment(
    @Body() createAttachmentDto: AttachmentDto,
  ): Promise<SASToken> {
    return null; //this.registrationService.createAttachment(createAttachmentDto);
  }

  @Post(':name/sas')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createSASToken(@Param() name: any): Promise<SASToken> {
    return null;
  }

  @Delete(':name')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteAttachment(@Param() name: any) {
    return null;
  }
}
