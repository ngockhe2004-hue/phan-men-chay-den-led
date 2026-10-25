import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScreensService {
  constructor(private prisma: PrismaService) {}

  private mapScreen(s: any) {
    if (!s) return null;
    return {
      ...s,
      resolution: {
        width: s.resolutionWidth || 1920,
        height: s.resolutionHeight || 1080,
      },
    };
  }

  private prepareScreenData(data: any) {
    const payload = { ...data };
    if (payload.resolution) {
      if (payload.resolution.width) payload.resolutionWidth = payload.resolution.width;
      if (payload.resolution.height) payload.resolutionHeight = payload.resolution.height;
      delete payload.resolution;
    }
    return payload;
  }

  async findAll() {
    const list = await this.prisma.screen.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map(s => this.mapScreen(s));
  }

  async findOne(id: string) {
    const screen = await this.prisma.screen.findUnique({ where: { id } });
    if (!screen) throw new NotFoundException(`Màn hình ID ${id} không tồn tại`);
    return this.mapScreen(screen);
  }

  async create(data: any) {
    const payload = this.prepareScreenData(data);
    const created = await this.prisma.screen.create({ data: payload });
    return this.mapScreen(created);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const payload = this.prepareScreenData(data);
    const updated = await this.prisma.screen.update({ where: { id }, data: payload });
    return this.mapScreen(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.screen.delete({ where: { id } });
  }

  async sendCommand(id: string, command: { type: string; value?: any }) {
    const screen = await this.findOne(id);
    const updateData: any = {};
    if (command.type === 'volume') {
      updateData.volume = command.value;
      updateData.isMuted = false;
    } else if (command.type === 'mute') {
      updateData.isMuted = !screen.isMuted;
    } else if (command.type === 'power') {
      updateData.powerState = command.value;
    } else if (command.type === 'apply_layout') {
      updateData.currentLayoutId = command.value;
    } else if (command.type === 'set_image_scale_mode') {
      updateData.imageScaleMode = command.value;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.screen.update({ where: { id }, data: updateData });
    }
    return { success: true, command };
  }

  async pair(code: string, details: any) {
    const payload = this.prepareScreenData(details);
    const existing = await this.prisma.screen.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      const updated = await this.prisma.screen.update({
        where: { id: existing.id },
        data: { ...payload, status: 'online', lastPing: 'Vừa xong' },
      });
      return this.mapScreen(updated);
    }
    const created = await this.prisma.screen.create({
      data: {
        code: code.toUpperCase(),
        name: payload.name || `Màn Hình (${code})`,
        location: payload.location || 'Chưa phân bổ',
        group: payload.group || 'Chung',
        status: 'online',
        lastPing: 'Vừa xong',
        ipAddress: payload.ipAddress || '192.168.1.1',
        currentLayoutId: 'layout-1',
        ...payload,
      },
    });
    return this.mapScreen(created);
  }
}
