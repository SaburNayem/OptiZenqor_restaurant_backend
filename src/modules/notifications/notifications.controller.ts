import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  listCustomer(@CurrentUser('sub') userId: string) {
    return this.service.listCustomer(userId);
  }

  @Patch('read')
  markRead(@CurrentUser('sub') userId: string, @Body('id') id: string) {
    return this.service.markRead(id, userId);
  }

  @Get('announcements')
  listAnnouncements(@Query('branchId') branchId?: string) {
    return this.service.listAnnouncements(branchId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Post('announcements')
  createAnnouncement(@CurrentUser('sub') createdById: string, @Body() body: any) {
    return this.service.createAnnouncement({ ...body, createdById });
  }
}
