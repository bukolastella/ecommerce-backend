import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { DisapproveBusinessDto } from './dto/business.dto';
import { UserRole } from '../admins/dto/admins.dto';
import { Roles } from '../roles.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('admin/businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  @ApiQuery({
    name: 'isEmailVerified',
    required: false,
  })
  findAll(@Query('isEmailVerified') isEmailVerified?: boolean) {
    return this.businessesService.findAll(isEmailVerified);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.businessesService.findOne(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.businessesService.remove(+id);
  // }

  @Patch('/approve/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  approveBusiness(@Param('id') id: number) {
    return this.businessesService.approveBusiness(id);
  }

  @Patch('/disapprove/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  disapproveBusiness(
    @Param('id') id: number,
    @Body() dto: DisapproveBusinessDto,
  ) {
    return this.businessesService.disapproveBusiness(id, dto);
  }
}
