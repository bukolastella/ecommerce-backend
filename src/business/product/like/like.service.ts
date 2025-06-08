import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductLike } from './entities/like.entity';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(ProductLike)
    private readonly productLikeRepo: Repository<ProductLike>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async toggle(id: number, userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const product = await this.productRepo.findOneBy({ id });

    if (!product) throw new BadRequestException("Can't find product");

    const likedProduct = await this.productLikeRepo.findOne({
      where: { product: { id }, userId },
    });

    if (likedProduct) {
      await this.productLikeRepo.delete(id);
    } else {
      const temp = this.productLikeRepo.create({
        product: { id: id },
        userId,
      });

      await this.productLikeRepo.save(temp);
    }

    return 'success';
  }

  async likesByUser(userId?: number) {
    if (!userId) throw new BadRequestException("Can't find user");

    const likedProduct = await this.productLikeRepo.find({
      where: { userId },
    });

    return likedProduct;
  }
}
