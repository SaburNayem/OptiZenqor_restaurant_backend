import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Patch('me')
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    return this.usersService.updateMyProfile(userId, body);
  }

  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Get('staff')
  listStaff() {
    return this.usersService.listStaff();
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('staff')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.usersService.createStaff(dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.setActive(id, isActive);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/assign-branches')
  assignBranches(@Param('id') id: string, @Body('branchIds') branchIds: string[]) {
    return this.usersService.assignBranches(id, branchIds || []);
  }
}
