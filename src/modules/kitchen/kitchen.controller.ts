import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { KitchenService } from './kitchen.service';

@ApiTags('Kitchen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER, Role.KITCHEN_VIEWER)
@Controller({ path: 'kitchen', version: '1' })
export class KitchenController {
  constructor(private readonly service: KitchenService) {}

  @Get('queue')
  queue(@Query('branchId') branchId: string) {
    return this.service.queue(branchId);
  }

  @Patch('orders/:id/preparing')
  preparing(@Param('id') id: string) {
    return this.service.markPreparing(id);
  }

  @Patch('orders/:id/ready')
  ready(@Param('id') id: string) {
    return this.service.markReady(id);
  }
}
