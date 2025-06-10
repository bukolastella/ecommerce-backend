import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { LikeService } from './like.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User: Likes')
@ApiBearerAuth('userToken')
@Controller('user/product')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':productId/like')
  toggle(
    @Param('productId') productId: number,
    @Request() req: RequestWithUser,
  ) {
    return this.likeService.toggle(productId, req.user?.id);
  }

  @Get('my-likes')
  likesByUser(@Request() req: RequestWithUser) {
    return this.likeService.likesByUser(req.user?.id);
  }
}
