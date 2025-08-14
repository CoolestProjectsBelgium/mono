import {
  Controller,
  Body,
  Post,
  Param,
  Delete,
  BadRequestException,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AzureBlobService } from '../azureblob/azureblob.service';
import { AttachmentDto } from '../dto/attachment.dto';
import { SASToken } from '../dto/sas-token.dto';
import { Readable } from 'stream';
import { InfoDto } from '../dto/info.dto';
import { Info } from '../info.decorator';
//import { Event } from '../models/event.model';
//import { FileUploadInterceptor } from '../file-upload/file-upload.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadValidator } from 'src/file-upload/file-upload.validator';

//TODO: Install local test with https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio%2Cblob-storage

@Controller('attachment')
@ApiTags('attachment')
@ApiCookieAuth()
export class AttachmentController {
  constructor(
    private readonly azureBlobService: AzureBlobService
  ) {}

  @Post('stream')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Info() info: InfoDto, 
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileUploadValidator({}),
        ],
  }),
    ) file: Express.Multer.File) 
    {
    if (!file) {
      throw new BadRequestException(
        'File is required and must be within the size limit',
      );
    }
    // const event = await Event.findByPk(info.currentEvent, {
    //   attributes: ['azure_storage_container'],
    // });

    const containerName = "coolestproject25";//event.azure_storage_container;
    const fileStream = Readable.from(file.buffer);
    const blobUrl = await this.azureBlobService.uploadStreamToAzure(
      containerName,
      fileStream,
      file.originalname,
    );

    // TODO: Shut down the stream if upload too big (file interceptor maybe?)
    // TODO: Check how we could to thumbnails for images/videos (https://apidog.com/blog/converting-images-to-jpeg-using-node-js-apidog/) 
    // 2 different blobs on azure

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
