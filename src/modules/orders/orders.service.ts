import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderEventsGateway } from 'src/gateways/order-events.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly events: OrderEventsGateway) {}

  async createFromCart(userId: string, cartId: string, fulfillmentType: 'delivery' | 'pickup', addressId?: string, note?: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: true, coupon: { include: { offer: true } } } });
    if (!cart || !cart.items.length) throw new NotFoundException('Cart not found or empty');

    const subtotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    const taxAmount = subtotal * 0.1;
    const discountAmount = cart.coupon?.offer?.discountType === 'percentage' ? subtotal * Number(cart.coupon.offer.discountValue) / 100 : Number(cart.coupon?.offer?.discountValue || 0);
    const deliveryFee = fulfillmentType === 'delivery' ? 40 : 0;
    const totalAmount = subtotal + taxAmount + deliveryFee - discountAmount;

    const order = await this.prisma.order.create({
      data: {
        orderNo: `OZ-${Date.now()}`,
        userId,
        branchId: cart.branchId,
        addressId,
        couponId: cart.couponId,
        fulfillmentType,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.pending,
        subtotal,
        taxAmount,
        discountAmount,
        deliveryFee,
        totalAmount,
        note,
        invoiceJson: { generatedAt: new Date().toISOString() },
        items: {
          create: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: 'Snapshot',
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            totalPrice: Number(i.unitPrice) * i.quantity,
            note: i.note,
          })),
        },
        statusHistory: { create: [{ status: OrderStatus.pending, note: 'Order placed' }] },
        payment: { create: { method: 'cash_on_delivery', amount: totalAmount, status: PaymentStatus.pending } },
      },
    });

    await this.prisma.cart.update({ where: { id: cart.id }, data: { isActive: false } });
    this.events.publishNewOrder(order.branchId, order);
    return order;
  }

  listCustomerOrders(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, include: { items: true, statusHistory: true }, orderBy: { createdAt: 'desc' } });
  }

  getOrderDetails(id: string, userId: string) {
    return this.prisma.order.findFirst({ where: { id, userId }, include: { items: true, statusHistory: true, payment: true } });
  }

  cancelOrder(id: string, userId: string) {
    return this.updateStatus(id, OrderStatus.cancelled, userId, 'Cancelled by customer');
  }

  dashboardList(branchId?: string) {
    return this.prisma.order.findMany({ where: branchId ? { branchId } : {}, include: { items: true }, orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: string, status: OrderStatus, actorUserId?: string, note?: string) {
    const order = await this.prisma.order.update({ where: { id }, data: { status } });
    await this.prisma.orderStatusHistory.create({ data: { orderId: id, status, note } });
    this.events.publishStatusUpdate(order.branchId, { orderId: id, status, note, actorUserId });
    return order;
  }
}
