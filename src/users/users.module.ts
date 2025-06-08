import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CartModule } from './cart/cart.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [CartModule],
})
export class UsersModule {}
