import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@Controller({ path: 'offers', version: '1' })
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @Get()
  list(@Query('branchId') branchId?: string) { return this.service.list(branchId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Post() create(@Body() body: any) { return this.service.create(body); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.SUPER_ADMIN)
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
