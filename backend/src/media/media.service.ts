import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: { type?: string; search?: string }) {
    const where: any = {};
    if (query?.type && query.type !== 'ALL') where.type = query.type;
    if (query?.search) where.title = { contains: query.search, mode: 'insensitive' };
    return this.prisma.mediaItem.findMany({ where, orderBy: { uploadedAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.mediaItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Media ID ${id} không tồn tại`);
    return item;
  }

  create(data: any) {
    return this.prisma.mediaItem.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.mediaItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mediaItem.delete({ where: { id } });
  }
}
