import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get(':branchId')
  get(@CurrentUser('sub') userId: string, @Param('branchId') branchId: string) {
    return this.service.getOrCreateActiveCart(userId, branchId);
  }

  @Post('items')
  addItem(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.service.addItem(userId, body.branchId, body.menuItemId, body.quantity || 1);
  }

  @Patch(':cartId/items/:itemId')
  updateItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string, @Body('quantity') quantity: number) {
    return this.service.updateItemQuantity(cartId, itemId, quantity);
  }

  @Delete(':cartId/items/:itemId')
  removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(cartId, itemId);
  }

  @Delete(':cartId/clear')
  clear(@Param('cartId') cartId: string) {
    return this.service.clear(cartId);
  }

  @Patch(':cartId/coupon')
  coupon(@Param('cartId') cartId: string, @Body('code') code: string) {
    return this.service.applyCoupon(cartId, code);
  }

  @Patch(':cartId/instruction')
  instruction(@Param('cartId') cartId: string, @Body('specialInstruction') note: string) {
    return this.service.setInstruction(cartId, note);
  }
}
