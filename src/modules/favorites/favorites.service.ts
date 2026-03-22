import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.favorite.findMany({ where: { userId }, include: { menuItem: true, branch: true } });
  }

  add(userId: string, menuItemId?: string, branchId?: string) {
    return this.prisma.favorite.create({ data: { userId, menuItemId, branchId } });
  }

  remove(id: string, userId: string) {
    return this.prisma.favorite.deleteMany({ where: { id, userId } });
  }
}
