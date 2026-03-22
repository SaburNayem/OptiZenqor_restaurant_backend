import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { paginate } from 'src/common/helpers/pagination.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async list(query: { page?: number; limit?: number; search?: string; categoryId?: string; branchId?: string }) {
    const cacheKey = `menu:${JSON.stringify(query)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: any = {
      deletedAt: null,
      isActive: true,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.branchId
        ? { branchAvailability: { some: { branchId: query.branchId, isAvailable: true } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        skip,
        take,
        include: { category: true, variants: true, addons: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    const result = { data: items, meta: { total, page, limit } };
    await this.cache.set(cacheKey, result, 120000);
    return result;
  }

  details(id: string) {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, variants: true, addons: true },
    });
  }

  async create(data: any) {
    const out = await this.prisma.menuItem.create({ data });
    await this.cache.clear();
    return out;
  }

  async update(id: string, data: any) {
    const out = await this.prisma.menuItem.update({ where: { id }, data });
    await this.cache.clear();
    return out;
  }

  async remove(id: string) {
    const out = await this.prisma.menuItem.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.cache.clear();
    return out;
  }

  async setBranchAvailability(menuItemId: string, branchId: string, isAvailable: boolean) {
    await this.cache.clear();
    return this.prisma.menuItemBranchAvailability.upsert({
      where: { menuItemId_branchId: { menuItemId, branchId } },
      update: { isAvailable },
      create: { menuItemId, branchId, isAvailable },
    });
  }
}
