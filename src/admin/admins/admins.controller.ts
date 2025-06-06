import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { ApiParam } from '@nestjs/swagger';
import { CreateAdminDto, EditAdminDto } from './dto/admins.dto';

@Controller('admin')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminsService.createAdmin(dto);
  }

  @Get('admins')
  getAllAdmins() {
    return this.adminsService.getAllAdmins();
  }

  @Get('admins/:adminId')
  @ApiParam({
    name: 'adminId',
    example: 1,
  })
  getSingleAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.adminsService.getSingleAdmin(adminId);
  }

  @Patch('admins')
  editAdmin(@Body() dto: EditAdminDto) {
    return this.adminsService.editAdmin(dto);
  }

  @Delete('admins/:adminId')
  deleteAdmin(@Param('adminId') adminId: number) {
    return this.adminsService.deleteAdmin(adminId);
  }
}
