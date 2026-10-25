import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LayoutsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.layoutTemplate.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string) {
    const l = await this.prisma.layoutTemplate.findUnique({ where: { id } });
    if (!l) throw new NotFoundException(`Layout ID ${id} không tồn tại`);
    return l;
  }
  create(data: any) { return this.prisma.layoutTemplate.create({ data }); }
  async update(id: string, data: any) { await this.findOne(id); return this.prisma.layoutTemplate.update({ where: { id }, data }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.layoutTemplate.delete({ where: { id } }); }
}
