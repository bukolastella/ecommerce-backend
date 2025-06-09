import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { ConfigService } from '@nestjs/config';
import { Users } from '../entities/users.entity';
import { createHmac } from 'crypto';
import { IncomingHttpHeaders } from 'http';

export type PaystackWebhookPayload = {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string | null;
    fees_breakdown: null;
    log: null;
    fees: number;
    fees_split: null;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: null;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: object;
    subaccount: object;
    split: object;
    order_id: number | null;
    paidAt: string;
    requested_amount: number;
    pos_transaction_data: null;
    source: {
      type: string;
      source: string;
      entry_point: string;
      identifier: string | null;
    };
  };
};

export interface PaystackRes {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

@Injectable()
export class CheckoutService {
  private readonly paystackUrl =
    'https://api.paystack.co/transaction/initialize';
  private readonly paystackSecretKey: string;

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get(
      'PAYSTACK_SECRET_KEY',
    ) as string;
  }

  async initializeTransaction(
    email: string,
    amount: number,
  ): Promise<PaystackRes> {
    try {
      const payload = {
        email,
        amount,
        callback_url: 'https://hello.pstk.xyz/callback',
      };

      const response = await fetch(this.paystackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as PaystackRes;
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      const data = (await response.json()) as PaystackRes;
      return data;
    } catch (error) {
      console.error('Paystack initialization failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Transaction initialization failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(user?: Users) {
    if (!user) throw new BadRequestException('User not found');
    const userId = user?.id;
    const userCart = await this.cartService.cartByUser(userId);

    for (const item of userCart) {
      if (item.quantity > item.product.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.quantity}, requested: ${item.quantity}`,
        );
      }
    }

    const amountToPay = userCart.reduce((prev, curr) => {
      return prev + curr.quantity * curr.product.price;
    }, 0);

    const payRes = await this.initializeTransaction(
      user.email,
      amountToPay * 100,
    );
    return { amountToPay, url: payRes.data?.authorization_url };
  }

  paystackWebhook(dto: PaystackWebhookPayload, headers: IncomingHttpHeaders) {
    const hash = createHmac('sha512', this.paystackSecretKey)
      .update(JSON.stringify(dto))
      .digest('hex');

    if (hash == headers['x-paystack-signature']) {
      // Retrieve the request's body
      const event = dto;
      if (event.event === 'charge.success') {
        //create an order
      }
    }
    return null;
  }
}
