import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS - cho phép CMS frontend & tất cả thiết bị Player Web App kết nối
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Auto-validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`\n🚀 LED CMS Backend running on: http://localhost:${port}`);
  console.log(`📖 API Base URL: http://localhost:${port}/api`);
  console.log(`🗄️  MinIO Console: http://localhost:9001`);
  console.log(`🖥️  Adminer DB: http://localhost:8080\n`);
}
bootstrap();
