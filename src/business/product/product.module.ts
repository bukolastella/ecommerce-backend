import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/admin/category/entities/category.entity';
import { LikeModule } from './like/like.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), LikeModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
