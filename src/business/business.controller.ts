import { Controller, Get, Param, Request } from '@nestjs/common';
import { TransactionService } from 'src/transaction/transaction.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(
    // private readonly businessService: BusinessService,
    private readonly transService: TransactionService,
  ) {}

  @Get('transactions')
  findAllForBusiness(@Request() req: RequestWithUser) {
    return this.transService.findAllForBusiness(req.user?.id);
  }

  @Get('transactions/stat')
  transactionStatForBusiness(@Request() req: RequestWithUser) {
    return this.transService.transactionStatForBusiness(req.user?.id);
  }

  @Get('transactions/:id')
  findOne(@Param('id') id: number) {
    return this.transService.findOne(+id);
  }
}
