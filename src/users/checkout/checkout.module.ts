import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Cart } from '../cart/entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/orderItem.entity';
import { Product } from 'src/business/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Order, OrderItem, Product]),
    CartModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
