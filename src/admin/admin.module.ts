import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { AdminsModule } from './admins/admins.module';
import { BusinessesModule } from './businesses/businesses.module';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Users]),
    MailModule,
    AdminsModule,
    BusinessesModule,
    UsersModule,
    CategoryModule,
    TransactionModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, UsersService],
})
export class AdminModule {}
