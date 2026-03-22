import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('orders/:orderId')
  get(@Param('orderId') orderId: string) {
    return this.service.getOrderPayment(orderId);
  }

  @Patch('orders/:orderId/method')
  updateMethod(@Param('orderId') orderId: string, @Body('method') method: string) {
    return this.service.updateMethod(orderId, method);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Patch('orders/:orderId/status')
  updateStatus(@Param('orderId') orderId: string, @Body() body: any) {
    return this.service.updateStatus(orderId, body.status, body.transactionId);
  }

  @Post('webhook/:provider')
  webhook(@Param('provider') provider: string, @Body() payload: any) {
    return this.service.webhookPlaceholder(provider, payload);
  }
}
