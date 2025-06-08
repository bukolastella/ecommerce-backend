import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('toggle-cart/:id')
  toggle(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.cartService.toggle(id, req.user?.id);
  }

  @Get('my-cart')
  likesByUser(@Request() req: RequestWithUser) {
    return this.cartService.cartByUser(req.user?.id);
  }
}
