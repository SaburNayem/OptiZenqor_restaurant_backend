import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService, @Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async overview(branchId?: string, from?: string, to?: string) {
    const key = `overview:${branchId || 'all'}:${from || ''}:${to || ''}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const where: any = {
      ...(branchId ? { branchId } : {}),
      ...(from || to ? { createdAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } } : {}),
    };

    const [orders, completed, cancelled, agg] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: 'completed' } }),
      this.prisma.order.count({ where: { ...where, status: 'cancelled' } }),
      this.prisma.order.aggregate({ where, _sum: { totalAmount: true }, _avg: { totalAmount: true } }),
    ]);

    const out = {
      orders,
      completed,
      cancelled,
      completionRate: orders ? (completed / orders) * 100 : 0,
      cancellationRate: orders ? (cancelled / orders) * 100 : 0,
      revenue: Number(agg._sum.totalAmount || 0),
      averageOrderValue: Number(agg._avg.totalAmount || 0),
    };

    await this.cache.set(key, out, 60000);
    return out;
  }

  bestSelling(branchId?: string) {
    return this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: branchId ? { order: { branchId } } : {},
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });
  }
}
