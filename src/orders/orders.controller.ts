import { Controller, Get, Body, Patch, Param, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { UpdateOrderStatusDto } from './dto/order.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllByUserId(@Request() req: RequestWithUser) {
    return this.ordersService.findAllByUserId(req.user?.id);
  }

  @Get(':id')
  findOneByUserId(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.ordersService.findOneByUserId(id, req.user?.id);
  }

  @Patch('update-status/:id')
  updateStatus(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderStatusDto,
    @Request() req: RequestWithUser,
  ) {
    return this.ordersService.updateStatus(+id, updateOrderDto, req.user?.id);
  }
}
