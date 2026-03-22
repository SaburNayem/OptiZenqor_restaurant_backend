import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, data: any) {
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  update(id: string, userId: string, data: any) {
    return this.prisma.address.updateMany({ where: { id, userId }, data });
  }

  delete(id: string, userId: string) {
    return this.prisma.address.deleteMany({ where: { id, userId } });
  }

  async setDefault(id: string, userId: string) {
    await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return this.prisma.address.update({ where: { id }, data: { isDefault: true } });
  }
}
