import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScreensService } from './screens.service';

@UseGuards(AuthGuard('jwt'))
@Controller('screens')
export class ScreensController {
  constructor(private screensService: ScreensService) {}

  @Get()
  findAll() { return this.screensService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.screensService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.screensService.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.screensService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.screensService.remove(id); }

  @Post(':id/command')
  sendCommand(@Param('id') id: string, @Body() body: { type: string; value?: any }) {
    return this.screensService.sendCommand(id, body);
  }

  @Post('pair')
  pair(@Body() body: { code: string; [key: string]: any }) {
    return this.screensService.pair(body.code, body);
  }
}
