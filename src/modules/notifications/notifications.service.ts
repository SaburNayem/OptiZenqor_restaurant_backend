import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  listCustomer(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  createAnnouncement(data: {
    title: string;
    body: string;
    branchId?: string;
    createdById: string;
  }) {
    return this.prisma.announcement.create({ data });
  }

  listAnnouncements(branchId?: string) {
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ branchId: null }, ...(branchId ? [{ branchId }] : [])],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
