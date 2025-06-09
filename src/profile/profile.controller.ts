import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Users } from 'src/users/entities/users.entity';
import { Request as ExpressRequest } from 'express';
import { UserTypeGuard } from 'src/auth/user-type.guard';

export interface RequestWithUser extends ExpressRequest {
  user?: Users;
}

@Controller()
export class ProfileController {
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @UseGuards(UserTypeGuard)
  @Get('admin/profile')
  @ApiBearerAuth()
  getAdminProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
