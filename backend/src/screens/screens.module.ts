import { Module } from '@nestjs/common';
import { ScreensService } from './screens.service';
import { ScreensController } from './screens.controller';

@Module({ controllers: [ScreensController], providers: [ScreensService] })
export class ScreensModule {}
