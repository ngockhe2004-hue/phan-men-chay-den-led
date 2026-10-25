import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'ONLINE',
      system: 'LED Signage CMS Pro Backend API',
      version: '2.0.0',
      database: 'PostgreSQL 16 (Connected)',
      cache: 'Redis 7 (Connected)',
      storage: 'MinIO S3 (Connected)',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth/login',
        screens: '/api/screens',
        media: '/api/media',
        layouts: '/api/layouts',
        schedules: '/api/schedules',
        logs: '/api/logs',
        minioConsole: 'http://localhost:9001',
        adminerGui: 'http://localhost:8080',
        webCms: 'http://localhost:3000',
      },
    };
  }
}
