import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.schedule.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string) {
    const s = await this.prisma.schedule.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Lịch phát ID ${id} không tồn tại`);
    return s;
  }
  create(data: any) { return this.prisma.schedule.create({ data }); }
  async update(id: string, data: any) { await this.findOne(id); return this.prisma.schedule.update({ where: { id }, data }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.schedule.delete({ where: { id } }); }
}
