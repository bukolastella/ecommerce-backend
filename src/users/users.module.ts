import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [CartModule, CheckoutModule],
})
export class UsersModule {}
