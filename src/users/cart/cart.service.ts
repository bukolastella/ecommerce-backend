import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/business/product/entities/product.entity';
import { AddCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async add(dto: AddCartDto, userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const { productId, quantity } = dto;

    const product = await this.productRepo.findOneBy({ id: productId });

    if (!product) throw new BadRequestException("Can't find product");

    const temp = this.cartRepo.create({
      product: { id: productId },
      userId,
      quantity,
    });

    await this.cartRepo.save(temp);

    return 'success';
  }

  async remove(id: number, userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const cart = await this.cartRepo.findOneBy({ id });

    if (!cart) throw new BadRequestException("Can't find cart");

    await this.cartRepo.delete(id);

    return 'success';
  }

  async cartByUser(userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const cartProduct = await this.cartRepo.find({
      where: { userId },
    });

    return cartProduct;
  }
}
