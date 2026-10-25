import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  /** POST /api/player/pair — Đăng ký thiết bị bằng pairing code */
  async pair(code: string, deviceInfo: any) {
    const upperCode = code.toUpperCase();
    const existing = await this.prisma.screen.findUnique({ where: { code: upperCode } });

    if (existing) {
      return this.prisma.screen.update({
        where: { id: existing.id },
        data: {
          status: 'online',
          lastPing: new Date().toISOString(),
          appVersion: deviceInfo.appVersion || existing.appVersion,
          ipAddress: deviceInfo.ipAddress || existing.ipAddress,
          deviceModel: deviceInfo.deviceModel || existing.deviceModel,
        },
      });
    }

    // Tạo mới nếu chưa tồn tại
    return this.prisma.screen.create({
      data: {
        code: upperCode,
        name: deviceInfo.name || `Màn Hình (${upperCode})`,
        location: deviceInfo.location || 'Chưa phân bổ',
        group: deviceInfo.group || 'Chung',
        status: 'online',
        lastPing: new Date().toISOString(),
        ipAddress: deviceInfo.ipAddress || '',
        appVersion: deviceInfo.appVersion || 'v1.0.0',
        deviceModel: deviceInfo.deviceModel || 'Unknown',
        currentLayoutId: null,
      },
    });
  }

  /** GET /api/player/config/:code — Lấy layout + danh sách media */
  async getConfig(code: string) {
    const screen = await this.prisma.screen.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!screen) throw new NotFoundException(`Không tìm thấy màn hình với code: ${code}`);

    let layout = null;
    let mediaItems: any[] = [];

    if (screen.currentLayoutId) {
      layout = await this.prisma.layoutTemplate.findUnique({
        where: { id: screen.currentLayoutId },
      });

      if (layout && layout.zones) {
        // Lấy tất cả mediaId từ các zone
        const zones = layout.zones as any[];
        const mediaIds = new Set<string>();
        zones.forEach((zone: any) => {
          (zone.mediaPlaylist || []).forEach((item: any) => {
            if (item.mediaId) mediaIds.add(item.mediaId);
          });
        });

        if (mediaIds.size > 0) {
          mediaItems = await this.prisma.mediaItem.findMany({
            where: { id: { in: Array.from(mediaIds) } },
          });
        }
      }
    }

    return { screen, layout, mediaItems };
  }

  /** POST /api/player/heartbeat — Nhịp tim thiết bị */
  async heartbeat(data: { code?: string; screenId?: string; status?: string; appVersion?: string }) {
    const where = data.code
      ? { code: data.code.toUpperCase() }
      : data.screenId
      ? { id: data.screenId }
      : null;

    if (!where) return { success: false, message: 'Thiếu code hoặc screenId' };

    try {
      await this.prisma.screen.update({
        where,
        data: {
          status: 'online',
          lastPing: new Date().toISOString(),
          ...(data.appVersion ? { appVersion: data.appVersion } : {}),
        },
      });
      return { success: true, timestamp: new Date().toISOString() };
    } catch {
      return { success: false, message: 'Thiết bị không tìm thấy' };
    }
  }

  /** POST /api/player/proof-of-play — Báo đã phát xong */
  async logProofOfPlay(data: {
    screenId: string;
    screenName: string;
    mediaId: string;
    mediaTitle: string;
    mediaType?: string;
    durationSeconds: number;
    status?: string;
  }) {
    return this.prisma.proofOfPlayLog.create({
      data: {
        screenId: data.screenId,
        screenName: data.screenName,
        mediaId: data.mediaId,
        mediaTitle: data.mediaTitle,
        mediaType: data.mediaType || 'video',
        durationSeconds: data.durationSeconds,
        status: data.status || 'completed',
      },
    });
  }
}
