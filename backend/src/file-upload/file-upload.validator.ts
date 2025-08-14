import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  FileValidator,
} from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';
export type FileUploadValidatorOptions = {
    
};


export class FileUploadValidator extends FileValidator<FileUploadValidatorOptions, IFile>  {
  //constructor();

  async isValid(file: IFile): Promise<boolean> {
    // Implement your validation logic here
    // For example, check file size, type, etc.
    if (!file || !file.buffer) {
      return false; // File is required and must be within the size limit
    }

    // Example validation: check if file size is less than 1MB
    if (file.size > 1024 * 1024) {
      return false; // File size exceeds 1MB
    }
    
    // Example validation: check if file type is 'image/jpeg'
    // if (file.mimetype !== 'image/jpeg') {
    //   return false; // Invalid file type
    // }
    return true; // File is valid
  }

  buildErrorMessage(file: IFile): string {
    if (!file || !file.buffer) {
      return 'File is required and must be within the size limit';
    }
    if (file.size > 1024 * 1024) {
      return 'File size exceeds 1MB';
    }
    // if (file.mimetype !== 'image/jpeg') {
    //   return 'Invalid file type. Only JPEG images are allowed';
    // }
    return '';
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
