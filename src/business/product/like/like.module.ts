import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductLike } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductLike]), LikeModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
