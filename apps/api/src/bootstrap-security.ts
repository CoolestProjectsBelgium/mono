import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { env } from 'process';

export function parseCorsOrigins(value?: string): string[] {
  return (value ?? env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configureSecurity(app: INestApplication): void {
  app.use(
    helmet({
      // JSON API — no HTML responses; skip CSP (see NestJS Helmet guidance).
      contentSecurityPolicy: false,
      // Allow registration SPA on another subdomain to fetch blobs/thumbnails.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const corsOrigins = parseCorsOrigins();

  if (corsOrigins.length > 0) {
    app.enableCors({
      origin: corsOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['Content-Type', 'Accept', 'Accept-Language', 'x-csrf-token'],
      credentials: true,
    });
  }
}
