import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  FilterTransactionDto,
  WithdrawalTransactionDto,
} from './dto/transaction.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { isUserType } from 'src/auth/userType.decorator';
import { UserType } from 'src/users/entities/users.entity';
import { UserTypeGuard } from 'src/auth/user-type.guard';

@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(UserTypeGuard)
  @isUserType(UserType.ADMIN, UserType.BUSINESS)
  @Post()
  withdrawal(@Body() dto: WithdrawalTransactionDto) {
    return this.transactionService.withdrawal(dto);
  }

  @Get()
  findAll(@Query() dto: FilterTransactionDto) {
    return this.transactionService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  // @Get()
  // findAllForBusiness(@Request() req: RequestWithUser) {
  //   return this.transactionService.findAllForBusiness(req.user?.id);
  // }
}
