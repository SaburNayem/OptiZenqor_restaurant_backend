import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('overview')
  overview(@Query('branchId') branchId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.overview(branchId, from, to);
  }

  @Get('best-selling')
  bestSelling(@Query('branchId') branchId?: string) {
    return this.service.bestSelling(branchId);
  }
}
