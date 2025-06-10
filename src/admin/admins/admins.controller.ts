import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto, EditAdminDto, UserRole } from './dto/admins.dto';
import { Roles } from '../roles.decorator';

@ApiTags('Admin: Admins')
@ApiBearerAuth('adminToken')
@Controller('admin')
@Roles(UserRole.SUPER_ADMIN)
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
  getSingleAdmin(@Param('adminId') adminId: number) {
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
