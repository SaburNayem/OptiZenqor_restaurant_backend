import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('from-cart')
  createFromCart(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.service.createFromCart(userId, body.cartId, body.fulfillmentType, body.addressId, body.note);
  }

  @Get('my')
  listMy(@CurrentUser('sub') userId: string) {
    return this.service.listCustomerOrders(userId);
  }

  @Get('my/:id')
  details(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.service.getOrderDetails(id, userId);
  }

  @Patch('my/:id/cancel')
  cancel(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.service.cancelOrder(id, userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER, Role.KITCHEN_VIEWER)
  @Get('dashboard/list')
  dashboard(@Query('branchId') branchId?: string) {
    return this.service.dashboardList(branchId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER, Role.KITCHEN_VIEWER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @CurrentUser('sub') userId: string,
    @Body('note') note?: string,
  ) {
    return this.service.updateStatus(id, status, userId, note);
  }
}
