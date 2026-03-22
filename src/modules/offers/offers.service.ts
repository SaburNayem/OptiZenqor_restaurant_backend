import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService, @Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async list(branchId?: string) {
    const key = `offers:${branchId || 'all'}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;
    const offers = await this.prisma.offer.findMany({ where: { isActive: true, OR: [{ isGlobal: true }, ...(branchId ? [{ branchId }] : [])] }, include: { coupons: true } });
    await this.cache.set(key, offers, 120000);
    return offers;
  }

  async create(data: any) { const out = await this.prisma.offer.create({ data }); await this.cache.clear(); return out; }
  async update(id: string, data: any) { const out = await this.prisma.offer.update({ where: { id }, data }); await this.cache.clear(); return out; }
  async remove(id: string) { const out = await this.prisma.offer.update({ where: { id }, data: { isActive: false } }); await this.cache.clear(); return out; }
}
