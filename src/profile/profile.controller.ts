import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Users } from 'src/users/entities/users.entity';
import { Request as ExpressRequest } from 'express';

export interface RequestWithUser extends ExpressRequest {
  user?: Users;
}

@Controller()
export class ProfileController {
  @Get('user/profile')
  @ApiBearerAuth('userToken')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Get('business/profile')
  @ApiBearerAuth('businessToken')
  getBusinessProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Get('admin/profile')
  @ApiBearerAuth('adminToken')
  getAdminProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
