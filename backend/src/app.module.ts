import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScreensModule } from './screens/screens.module';
import { MediaModule } from './media/media.module';
import { LayoutsModule } from './layouts/layouts.module';
import { SchedulesModule } from './schedules/schedules.module';
import { LogsModule } from './logs/logs.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { PlayerModule } from './player/player.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ScreensModule,
    MediaModule,
    LayoutsModule,
    SchedulesModule,
    LogsModule,
    UploadModule,
    PlayerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
