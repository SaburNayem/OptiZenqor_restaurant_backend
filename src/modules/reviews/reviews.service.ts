import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: any) {
    return this.prisma.review.create({ data: { ...data, userId } });
  }

  list(query: { branchId?: string; menuItemId?: string }) {
    return this.prisma.review.findMany({
      where: {
        isVisible: true,
        ...(query.branchId ? { branchId: query.branchId } : {}),
        ...(query.menuItemId ? { menuItemId: query.menuItemId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  moderate(id: string, isVisible: boolean) {
    return this.prisma.review.update({ where: { id }, data: { isVisible } });
  }

  async ratingSummary(branchId?: string, menuItemId?: string) {
    const items = await this.list({ branchId, menuItemId });
    const total = items.length;
    const average = total ? items.reduce((sum, i) => sum + i.rating, 0) / total : 0;
    return { total, average };
  }
}
