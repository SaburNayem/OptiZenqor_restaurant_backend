import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.service.create(userId, body);
  }

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('summary')
  summary(
    @Query('branchId') branchId?: string,
    @Query('menuItemId') menuItemId?: string,
  ) {
    return this.service.ratingSummary(branchId, menuItemId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_MANAGER)
  @Patch('moderate')
  moderate(@Body('id') id: string, @Body('isVisible') isVisible: boolean) {
    return this.service.moderate(id, isVisible);
  }
}
