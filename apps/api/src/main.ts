import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Behind nginx TLS proxy in dev/prod — needed for secure cookies and X-Forwarded-Proto.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed =
        /\.coolestprojects\.localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin);
      callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
    },
    credentials: true,
  });

  app.use(cookieParser(env.JWT_KEY));

  const config = new DocumentBuilder()
    .setTitle('Coolestprojects registration')
    .setDescription(
      "This api exposes the api's for the Coolestproject registration website, voting system, event setup.",
    )
    .setVersion('1.0')
    .addTag('registration')
    .addBearerAuth()
    .addCookieAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(env.API_PORT || 3001);
}
bootstrap();
