import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { LikeService } from './like.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('product')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('like/:id')
  toggle(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.likeService.toggle(id, req.user?.id);
  }

  @Get('my-likes')
  likesByUser(@Request() req: RequestWithUser) {
    return this.likeService.likesByUser(req.user?.id);
  }
}
