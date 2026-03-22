import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.branch.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  details(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true, assignments: true, menuAvailability: true } },
      },
    });
  }

  create(data: any) {
    return this.prisma.branch.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async setOpenStatus(id: string, isOpen: boolean) {
    const exists = await this.prisma.branch.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Branch not found');
    return this.prisma.branch.update({ where: { id }, data: { isOpen } });
  }

  summary(id: string) {
    return this.details(id);
  }
}
