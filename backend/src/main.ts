import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { initFirebaseAdmin } from './auth/firebase-admin.init';
import { validateEnv } from './common/env-validation';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  validateEnv();
  initFirebaseAdmin();

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // ALLOWED_ORIGINS is a comma-separated list, e.g.
  // "https://admin.yourapp.com,https://yourapp.com". Left unset in local
  // dev, this falls back to allowing everything so the Android app
  // (which doesn't send an Origin header) and localhost admin panel both
  // work without extra config — tighten this before a real deployment.
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : undefined;
  app.enableCors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
