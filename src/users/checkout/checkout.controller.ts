import { Controller, Post, Body, Request, HttpCode } from '@nestjs/common';
import { CheckoutService, PaystackWebhookPayload } from './checkout.service';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/public.decorator';

@ApiTags('User: Checkout')
@ApiBearerAuth('userToken')
@Controller('user/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  create(@Request() req: RequestWithUser) {
    return this.checkoutService.create(req.user);
  }

  @HttpCode(200)
  @Public()
  @Post('paystack-webhook')
  paysatckWebhook(
    @Body() dto: PaystackWebhookPayload,
    @Request() req: RequestWithUser,
  ) {
    return this.checkoutService.paystackWebhook(dto, req.headers);
  }
}
