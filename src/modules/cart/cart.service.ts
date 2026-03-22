import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateActiveCart(userId: string, branchId: string) {
    let cart = await this.prisma.cart.findFirst({ where: { userId, isActive: true }, include: { items: true } });
    if (cart && cart.branchId !== branchId) throw new BadRequestException('One branch per active cart');
    if (!cart) cart = await this.prisma.cart.create({ data: { userId, branchId, isActive: true }, include: { items: true } });
    return this.computeTotals(cart.id);
  }

  async addItem(userId: string, branchId: string, menuItemId: string, quantity: number) {
    const cart = await this.getOrCreateActiveCart(userId, branchId);
    const menu = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menu) throw new BadRequestException('Menu item not found');
    await this.prisma.cartItem.upsert({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, menuItemId, quantity, unitPrice: menu.basePrice },
    });
    return this.computeTotals(cart.id);
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.computeTotals(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.computeTotals(cartId);
  }

  clear(cartId: string) { return this.prisma.cartItem.deleteMany({ where: { cartId } }); }
  async applyCoupon(cartId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code }, include: { offer: true } });
    if (!coupon) throw new BadRequestException('Invalid coupon');
    await this.prisma.cart.update({ where: { id: cartId }, data: { couponId: coupon.id } });
    return this.computeTotals(cartId);
  }
  async setInstruction(cartId: string, specialInstruction: string) {
    await this.prisma.cart.update({ where: { id: cartId }, data: { specialInstruction } });
    return this.computeTotals(cartId);
  }

  async computeTotals(cartId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: true, coupon: { include: { offer: true } } } });
    if (!cart) throw new BadRequestException('Cart not found');
    const subtotal = cart.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    const taxAmount = subtotal * 0.1;
    const discountAmount = cart.coupon?.offer?.discountType === 'percentage' ? subtotal * Number(cart.coupon.offer.discountValue) / 100 : Number(cart.coupon?.offer?.discountValue || 0);
    const deliveryFee = 40;
    return { ...cart, summary: { subtotal, taxAmount, discountAmount, deliveryFee, total: subtotal + taxAmount + deliveryFee - discountAmount } };
  }
}
