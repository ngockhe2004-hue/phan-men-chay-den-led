import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: { screenId?: string; limit?: number }) {
    return this.prisma.proofOfPlayLog.findMany({
      where: query?.screenId ? { screenId: query.screenId } : undefined,
      orderBy: { playedAt: 'desc' },
      take: query?.limit ?? 100,
    });
  }

  create(data: any) {
    return this.prisma.proofOfPlayLog.create({ data });
  }

  async getStats() {
    const [total, completed, screens] = await Promise.all([
      this.prisma.proofOfPlayLog.count(),
      this.prisma.proofOfPlayLog.count({ where: { status: 'completed' } }),
      this.prisma.proofOfPlayLog.groupBy({ by: ['screenId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
    ]);
    return { total, completed, interrupted: total - completed, topScreens: screens };
  }
}
