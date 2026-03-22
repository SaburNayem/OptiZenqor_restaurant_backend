import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}
  getOrderPayment(orderId: string) { return this.prisma.payment.findUnique({ where: { orderId } }); }
  updateMethod(orderId: string, method: string) { return this.prisma.payment.update({ where: { orderId }, data: { method } }); }
  updateStatus(orderId: string, status: any, transactionId?: string) {
    return this.prisma.payment.update({ where: { orderId }, data: { status, transactionId } });
  }
  webhookPlaceholder(provider: string, payload: any) {
    return { success: true, message: `Webhook placeholder for ${provider}`, payload };
  }
}
