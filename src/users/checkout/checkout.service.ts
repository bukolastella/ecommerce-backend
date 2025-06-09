import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { In, Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { ConfigService } from '@nestjs/config';
import { Users } from '../entities/users.entity';
import { createHmac } from 'crypto';
import { IncomingHttpHeaders } from 'http';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { Product } from 'src/business/product/entities/product.entity';
import {
  TransactionFrom,
  TransactionTo,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';

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
    metadata: {
      orders: Order[];
      orderItems: {
        businessId: number;
        productId: number;
        productName: string;
        productSlug: string;
        categoryId: number;
        images: string[];
        quantity: number;
        amount: number;
        cartId: number;
        currency: string;
      }[];
    };
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
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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
    metadata: Record<string, any>,
  ): Promise<PaystackRes> {
    try {
      const payload = {
        email,
        amount,
        callback_url: 'https://hello.pstk.xyz/callback',
        currency: 'NGN',
        metadata,
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

    if (userCart.length === 0)
      throw new BadRequestException('Nothing to checkout');

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

    const groupedByBusiness = userCart.reduce(
      (acc, item) => {
        const businessId = item.product.business.id;

        if (!acc[businessId]) {
          acc[businessId] = {
            business: item.product.business,
            products: [],
          };
        }

        acc[businessId].products.push(item);

        return acc;
      },
      {} as Record<number, { business: Users; products: Cart[] }>,
    );

    const groupedArray = Object.values(groupedByBusiness);

    const orders = groupedArray.map((ev) => ({
      userId: user.id,
      businessId: ev.business.id,
      totalAmount: ev.products.reduce((prev, curr) => {
        return prev + curr.quantity * curr.product.price;
      }, 0),
      status: OrderStatus.pending,
      currency: 'NGN',
    }));

    const orderItems = userCart.map((ev) => ({
      businessId: ev.product.business.id,
      productId: ev.product.id,
      productName: ev.product.name,
      productSlug: ev.product.slug,
      categoryId: ev.product.categoryId,
      images: ev.product.images,
      quantity: ev.quantity,
      amount: ev.product.price,
      cartId: ev.id,
      currency: 'NGN',
    }));

    const payRes = await this.initializeTransaction(
      user.email,
      amountToPay * 100,
      {
        orderItems,
        orders,
      },
    );
    return { amountToPay, url: payRes.data?.authorization_url };
  }

  async paystackWebhook(
    dto: PaystackWebhookPayload,
    headers: IncomingHttpHeaders,
  ) {
    const hash = createHmac('sha512', this.paystackSecretKey)
      .update(JSON.stringify(dto))
      .digest('hex');

    if (hash == headers['x-paystack-signature']) {
      // Retrieve the request's body
      const event = dto;

      if (event.event === 'charge.success') {
        const orderItems = event.data.metadata.orderItems;

        const orders = event.data.metadata.orders.map((ev) => {
          const filteredOrderItems = orderItems.filter(
            (item) => item.businessId === ev.businessId,
          );
          return {
            ...ev,
            orderItems: filteredOrderItems,
            transaction: [
              {
                type: TransactionType.add,
                to: TransactionTo.business,
                from: TransactionFrom.order,
                amount: 0.95 * ev.totalAmount,
                percentShare: '95%',
              },
              {
                type: TransactionType.add,
                to: TransactionTo.admin,
                from: TransactionFrom.order,
                amount: 0.05 * ev.totalAmount,
                percentShare: '5%',
              },
            ],
          };
        });

        const chartIds = orderItems.map((ev) => ev.cartId);
        await this.orderRepo.save(orders);

        const products = await this.productRepo.find({
          where: { id: In(orderItems.map((item) => item.productId)) },
        });

        products.forEach((product) => {
          const orderedQuantity =
            orderItems.find((item) => +item.productId === product.id)
              ?.quantity || 0;

          product.quantity -= +orderedQuantity;
        });
        await this.productRepo.save(products);
        await this.cartRepo.delete(chartIds);
      }
    }
    return null;
  }
}
