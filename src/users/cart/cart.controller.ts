import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddCartDto } from './dto/cart.dto';

@ApiTags('User: Cart')
@ApiBearerAuth('userToken')
@Controller('user/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  add(@Request() req: RequestWithUser, @Body() dto: AddCartDto) {
    return this.cartService.add(dto, req.user?.id);
  }

  @Post('remove/:id')
  remove(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.cartService.remove(id, req.user?.id);
  }

  @Get('my-cart')
  likesByUser(@Request() req: RequestWithUser) {
    return this.cartService.cartByUser(req.user?.id);
  }
}
