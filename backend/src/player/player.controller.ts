import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PlayerService } from './player.service';

/**
 * Player API — Không yêu cầu JWT (thiết bị Player không có token)
 * Prefix: /api/player
 */
@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  /** POST /api/player/pair */
  @Post('pair')
  pair(@Body() body: { code: string; [key: string]: any }) {
    return this.playerService.pair(body.code, body);
  }

  /** GET /api/player/config/:code */
  @Get('config/:code')
  getConfig(@Param('code') code: string) {
    return this.playerService.getConfig(code);
  }

  /** POST /api/player/heartbeat */
  @Post('heartbeat')
  heartbeat(@Body() body: { code?: string; screenId?: string; status?: string; appVersion?: string }) {
    return this.playerService.heartbeat(body);
  }

  /** POST /api/player/proof-of-play */
  @Post('proof-of-play')
  proofOfPlay(@Body() body: any) {
    return this.playerService.logProofOfPlay(body);
  }
}
