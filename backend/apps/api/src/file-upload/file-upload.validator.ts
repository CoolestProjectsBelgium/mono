import { FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { Event } from '@coolestprojects/database';
import { Op } from 'sequelize';

export type FileUploadValidatorOptions = {};

export class FileUploadValidator extends FileValidator<
  FileUploadValidatorOptions,
  IFile
> {
  async isValid(file: IFile): Promise<boolean> {
    const activeEvent = await Event.findOne({
      where: {
        eventBeginDate: { [Op.lt]: Date.now() },
        eventEndDate: { [Op.gt]: Date.now() },
      },
      attributes: ['maxFileSize'],
    });

    if (!activeEvent) {
      return false;
    }

    if (!file || !file.buffer) {
      return false;
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
    return 'There was no active event found or the file exceeds the maximum size limit';
  }
}
