import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { Op } from 'sequelize';
@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly fileInterceptor: NestInterceptor;
  constructor(private fieldName: string) {
    this.fieldName = fieldName;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // we need the current event in this context
    const activeEvent = await Event.findOne({
      where: {
        eventBeginDate: { [Op.lt]: Date.now() },
        eventEndDate: { [Op.gt]: Date.now() },
      },
      attributes: ['maxFileSize'],
    });

    const fileInterceptor = new (FileInterceptor(this.fieldName, {
      limits: { fileSize: activeEvent.maxFileSize },
    }))();

    return fileInterceptor.intercept(context, next);
  }
}
