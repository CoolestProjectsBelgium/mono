import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';
import { env } from 'process';
import { AppModule } from './app.module';



async function bootstrap(){
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser(env.JWT_KEY));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.anonId) {
      const anonId = randomUUID();

      res.cookie('anonId', anonId, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      req.cookies.anonId = anonId;
    }

    next();
  });

  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,

    getSessionIdentifier: (req) => {
      if (req.user) {
        return String((req.user as any).sub);
      }

      return req.cookies.anonId;
    },
    
    getCsrfTokenFromRequest: (req) =>
      req.headers["x-csrf-token"] as string,
  });

  app.use(doubleCsrfProtection);

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
