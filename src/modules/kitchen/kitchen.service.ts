import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderEventsGateway } from 'src/gateways/order-events.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KitchenService {
  constructor(private readonly prisma: PrismaService, private readonly events: OrderEventsGateway) {}

  queue(branchId: string) {
    return this.prisma.order.findMany({
      where: { branchId, status: { in: [OrderStatus.confirmed, OrderStatus.preparing] } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markPreparing(orderId: string) {
    const order = await this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.preparing } });
    this.events.publishKitchenUpdate(order.branchId, { orderId, status: 'preparing' });
    return order;
  }

  async markReady(orderId: string) {
    const order = await this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.ready } });
    this.events.publishKitchenUpdate(order.branchId, { orderId, status: 'ready' });
    return order;
  }
}
