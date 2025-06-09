import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [TransactionModule, ProductModule],
  controllers: [BusinessController],
  // providers: [BusinessService],
})
export class BusinessModule {}
