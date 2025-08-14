import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  FileValidator,
} from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';
// Import your Event model and Op from sequelize
import { Event } from '../models/event.model';
import { Op } from 'sequelize';

export type FileUploadValidatorOptions = {
    
};


export class FileUploadValidator extends FileValidator<FileUploadValidatorOptions, IFile>  {
  //constructor();

  async isValid(file: IFile): Promise<boolean> {

    const activeEvent = await Event.findOne({
      where: {
        eventBeginDate: { [Op.lt]: Date.now() },
        eventEndDate: { [Op.gt]: Date.now() },
      },
      attributes: ['maxFileSize'],
    });

    if (!activeEvent) {
      return false; // No active event, validation fails
    }
    
    if (!file || !file.buffer) {
      return false; // File is required
    }

    if (file.size > activeEvent.maxFileSize) {
      return false; 
    }
    
    console.log('File upload initiated with type:', file.mimetype);

    return true;
  }

  buildErrorMessage(file: IFile): string {
    if (!file || !file.buffer) {
      return 'File is required and must be within the size limit';
    }
    // if (file.mimetype !== 'image/jpeg') {
    //   return 'Invalid file type. Only JPEG images are allowed';
    // }
    return 'There was no active event found or the file exceeds the maximum size limit';
  }
  
  // private readonly fileInterceptor: NestInterceptor;
  // constructor(private fieldName: string) {
  //   this.fieldName = fieldName;
  // }

  // async intercept(
  //   context: ExecutionContext,
  //   next: CallHandler,
  // ): Promise<Observable<any>> {
  //   // we need the current event in this context
  //   const activeEvent = await Event.findOne({
  //     where: {
  //       eventBeginDate: { [Op.lt]: Date.now() },
  //       eventEndDate: { [Op.gt]: Date.now() },
  //     },
  //     attributes: ['maxFileSize'],
  //   });

  //   const fileInterceptor = new (FileInterceptor(this.fieldName, {
  //     limits: {}, //fileSize: activeEvent.maxFileSize
  //   }))();

  //   return fileInterceptor.intercept(context, next);
  //}
}
