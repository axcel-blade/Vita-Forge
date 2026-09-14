import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { configureCORS } from './common/cors';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  configureCORS(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  // URI versioning: routes are /api/v1/... by default; health stays version-neutral for Docker/K8s probes.
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}

bootstrap();
