import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BranchScope } from 'src/common/decorators/branch-scope.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { BranchScopeGuard } from 'src/common/guards/branch-scope.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateBranchDto } from './dto/create-branch.dto';
import { BranchesService } from './branches.service';

@ApiTags('Branches')
@Controller({ path: 'branches', version: '1' })
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  list() {
    return this.branchesService.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.branchesService.details(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, BranchScopeGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @BranchScope()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.branchesService.update(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, BranchScopeGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @BranchScope()
  @Patch(':id/open-status')
  openStatus(@Param('id') id: string, @Body('isOpen') isOpen: boolean) {
    return this.branchesService.setOpenStatus(id, isOpen);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, BranchScopeGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @BranchScope()
  @Get(':id/summary')
  summary(@Param('id') id: string) {
    return this.branchesService.summary(id);
  }
}
