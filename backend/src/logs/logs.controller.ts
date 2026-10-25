import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogsService } from './logs.service';

@UseGuards(AuthGuard('jwt'))
@Controller('logs')
export class LogsController {
  constructor(private service: LogsService) {}
  @Get() findAll(@Query('screenId') screenId?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ screenId, limit: limit ? parseInt(limit) : 100 });
  }
  @Get('stats') getStats() { return this.service.getStats(); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
}
