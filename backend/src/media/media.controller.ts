import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import { UploadService } from '../upload/upload.service';

@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private uploadService: UploadService,
  ) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('search') search?: string) {
    return this.mediaService.findAll({ type, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.mediaService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.mediaService.create(body); }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadToMinio(file);
    return this.mediaService.create({
      title: file.originalname,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      url: result.url,
      thumbnail: result.url,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      sizeLabel: this.formatSize(file.size),
      storagePath: result.path,
      tags: [],
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.mediaService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.mediaService.remove(id); }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
