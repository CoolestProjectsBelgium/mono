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
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
  });
  const config = app.get(ConfigService);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  configureSecurity(app);

  app.use(
    cookieParser([
      config.getOrThrow('api.jwt'),
      config.getOrThrow('adminjs.secret'),
    ]),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.anonId) {
      const anonId = randomUUID();
      const anonCookieOptions = buildAppCookieOptions(config, req);

      res.cookie('anonId', anonId, {
        httpOnly: true,
        sameSite: anonCookieOptions.sameSite,
        secure: anonCookieOptions.secure,
        path: '/',
        ...(anonCookieOptions.domain
          ? { domain: anonCookieOptions.domain }
          : {}),
      });

      req.cookies.anonId = anonId;
    }

    next();
  });

  const csrfCookieOptions = buildAppCookieOptions(config, {
    secure: true,
    headers: { 'x-forwarded-proto': 'https' },
  });
  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => config.getOrThrow('api.csrf'),

    // csrf-csrf defaults to a __Host- cookie name; do not set Domain.
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

    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/csrf-token' && req.method === 'GET') {
      res.json({ csrfToken: generateCsrfToken(req, res) });
      return;
    }
    next();
  });

  app.use(doubleCsrfProtection);

  if (env.NODE_ENV !== 'production') {
    const document_config = new DocumentBuilder()
      .setTitle('Coolestprojects registration')
      .setDescription(
        "This api exposes the api's for the Coolestproject registration website, voting system, event setup.",
      )
      .setVersion('1.0')
      .addTag('registration')
      .addCookieAuth(
        'jwt',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description:
            'Signed JWT cookie set after login/registration activation.',
        },
        'jwt-user-cookie',
      )
      .addCookieAuth(
        'adminjs',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'adminjs',
          description: 'Signed admin session cookie set after admin login.',
        },
        'admin-cookie',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Voting JWT returned by POST /auth/login.',
        },
        'jwt-voting',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-csrf-token',
          description:
            'CSRF token obtained from GET /csrf-token. Required on all state-changing (non-GET/HEAD/OPTIONS) requests.',
        },
        'csrf',
      )
      .build();
    const document = SwaggerModule.createDocument(app, document_config);
    document.paths['/csrf-token'] = {
      get: {
        tags: ['csrf'],
        summary: 'Get a CSRF token',
        description:
          'Issues a CSRF token to send back as the x-csrf-token header on subsequent state-changing requests, and sets the matching CSRF secret cookie. This route is served by middleware, not a controller, so it is documented here manually.',
        responses: {
          '200': {
            description: 'CSRF token issued.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { csrfToken: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    };
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(env.API_PORT || 3001);
}
bootstrap();
