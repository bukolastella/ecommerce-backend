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
import { AdminService } from './admin.service';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateAdminDto, EditAdminDto } from './dto/admin.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Get('admins')
  getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get('admins/:adminId')
  @ApiParam({
    name: 'adminId',
    example: 1,
  })
  getSingleAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.adminService.getSingleAdmin(adminId);
  }

  @Patch('admins')
  editAdmin(@Body() dto: EditAdminDto) {
    return this.adminService.editAdmin(dto);
  }

  @Delete('admins/:adminId')
  deleteAdmin(@Param('adminId') adminId: number) {
    return this.adminService.deleteAdmin(adminId);
  }
}
