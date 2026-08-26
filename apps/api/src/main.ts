import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';
import { env } from 'process';
import { AppModule } from './app.module';
import { configureSecurity } from './bootstrap-security';
import { buildAppCookieOptions } from './cookie-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  configureSecurity(app);

  app.use(cookieParser([env.JWT_KEY!, env.ADMINJS_COOKIE_SECRET!]));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.anonId) {
      const anonId = randomUUID();
      const anonCookieOptions = buildAppCookieOptions(req);

      res.cookie('anonId', anonId, {
        httpOnly: true,
        sameSite: anonCookieOptions.sameSite,
        secure: anonCookieOptions.secure,
        path: '/',
        ...(anonCookieOptions.domain ? { domain: anonCookieOptions.domain } : {}),
      });

      req.cookies.anonId = anonId;
    }

    next();
  });

  const csrfCookieOptions = buildAppCookieOptions({ secure: true, headers: { 'x-forwarded-proto': 'https' } });
  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,

    cookieOptions: {
      sameSite: csrfCookieOptions.sameSite,
      secure: csrfCookieOptions.secure,
      httpOnly: true,
      path: '/',
    },

    getSessionIdentifier: (req) => {
      const user = req.user as { id?: number } | undefined;
      if (user?.id) {
        return String(user.id);
      }

      return req.cookies.anonId;
    },

    getCsrfTokenFromRequest: (req) =>
      req.headers['x-csrf-token'] as string,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/csrf-token' && req.method === 'GET') {
      res.json({ csrfToken: generateCsrfToken(req, res) });
      return;
    }
    next();
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
