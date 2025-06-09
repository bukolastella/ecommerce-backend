import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async findAllByUserId(userId?: number) {
    if (!userId) throw new BadRequestException('User not found');
    const orders = await this.orderRepo.find({
      where: { userId: userId },
    });
    return orders;
  }

  async findOneByUserId(id: number, userId?: number) {
    if (!userId) throw new BadRequestException('User not found');

    const order = await this.orderRepo.findOneBy({
      userId: userId,
      id: id,
    });

    if (!order) throw new BadRequestException('Order not found');

    return { order };
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId?: number) {
    await this.findOneByUserId(id, userId);
    const order = await this.orderRepo.save({
      id,
      status: dto.status,
    });
    return order;
  }
}
