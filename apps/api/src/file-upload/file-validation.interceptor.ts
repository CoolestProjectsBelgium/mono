import { User, Event } from '@coolestprojects/database';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(@InjectModel(User) private readonly userModel: typeof User) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {

    const req = context.switchToHttp().getRequest();

    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      return next.handle();
    }

    const user = await this.userModel.findByPk(userId, { include: [Event], });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (file.size > user.event.maxFileSize) {
      throw new BadRequestException(
        `File too large. Max allowed is ${user.event.maxFileSize} bytes`,
      );
    }

    if (!user.event.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${user.event.allowedMimeTypes.join(
          ', ',
        )}`,
      );
    }

    return next.handle();
  }
}