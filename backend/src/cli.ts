import { NestFactory } from '@nestjs/core';
import { CommandService } from 'nestjs-command';
import { CliModule } from './cli/cli.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule);
  const commandService = app.get(CommandService);

  await commandService.exec();
  await app.close();
}

bootstrap();
