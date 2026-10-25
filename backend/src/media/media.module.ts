import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { UploadModule } from '../upload/upload.module';

@Module({ imports: [UploadModule], controllers: [MediaController], providers: [MediaService] })
export class MediaModule {}
