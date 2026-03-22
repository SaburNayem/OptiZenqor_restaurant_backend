import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'addresses', version: '1' })
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.service.list(userId);
  }

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.service.create(userId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('sub') userId: string, @Body() body: any) {
    return this.service.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.delete(id, userId);
  }

  @Patch(':id/default')
  setDefault(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.setDefault(id, userId);
  }
}
