import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/public.decorator';
import { TransactionService } from 'src/transaction/transaction.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private authService: AuthService,
    private transService: TransactionService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get('transactions/stat')
  transactionStatForAdmin() {
    return this.transService.transactionStatForAdmin();
  }
}
