import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/business/product/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async toggle(id: number, userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const product = await this.productRepo.findOneBy({ id });

    if (!product) throw new BadRequestException("Can't find product");

    const cartProduct = await this.cartRepo.findOne({
      where: { product: { id }, userId },
    });

    if (cartProduct) {
      await this.cartRepo.delete(id);
    } else {
      const temp = this.cartRepo.create({
        product: { id: id },
        userId,
      });

      await this.cartRepo.save(temp);
    }

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
