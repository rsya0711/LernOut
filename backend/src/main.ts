import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('LearnOutBootstrap');

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Allows Swagger UI assets
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global Validation Pipe with strict validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('LearnOut API')
    .setDescription(
      'Interactive Gamified Learning Platform & UTBK/SNBT Practice System REST API',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('System & Health', 'Health checks and server status')
    .addTag('Auth', 'User registration, login, token refresh')
    .addTag('Users', 'User profile, statistics, activity')
    .addTag('Courses', 'Course catalog, categories, enrollment')
    .addTag('Modules', 'Modules within courses')
    .addTag('Lessons', 'Bite-sized lesson content and completion')
    .addTag('Quizzes', 'Interactive quiz engine and submissions')
    .addTag('Progress', 'User learning progress and streak status')
    .addTag('Gamification', 'XP, levels, badges, and leaderboard')
    .addTag('Exams', 'UTBK/SNBT timed simulation and analysis')
    .addTag('Admin', 'Platform management and metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'LearnOut API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 LearnOut Backend is running on: http://localhost:${port}/api`);
  logger.log(`📖 Swagger Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
