import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.brandSetting.findMany({ orderBy: { key: 'asc' } }); }
  upsert(key: string, valueJson: Record<string, unknown>) {
    const jsonValue = valueJson as Prisma.InputJsonValue;
    return this.prisma.brandSetting.upsert({ where: { key }, update: { valueJson: jsonValue }, create: { key, valueJson: jsonValue } });
  }
}
