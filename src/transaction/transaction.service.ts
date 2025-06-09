import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FilterTransactionDto,
  WithdrawalTransactionDto,
} from './dto/transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  Transaction,
  TransactionFrom,
  TransactionTo,
  TransactionType,
} from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transRepo: Repository<Transaction>,
  ) {}

  async withdrawal(dto: WithdrawalTransactionDto) {
    const temp = this.transRepo.create({
      ...dto,
      type: TransactionType.withdrawal,
      from: TransactionFrom.system,
      to: TransactionTo.wallet,
    });

    const saved = await this.transRepo.save(temp);

    return saved;
  }

  async findAll(dto: FilterTransactionDto) {
    const { businessId, orderId, to, type } = dto;
    console.log(businessId, 'businessId');

    const whereCondition: FindOptionsWhere<Transaction> = {};

    if (to !== undefined) {
      whereCondition.to = to;
    }

    if (type !== undefined) {
      whereCondition.type = type;
    }

    if (businessId !== undefined) {
      whereCondition.order = { businessId: +businessId };
    }

    if (orderId !== undefined) {
      whereCondition.order = { id: orderId };
    }

    const transactions = await this.transRepo.find({ where: whereCondition });

    return transactions;
  }

  async findOne(id: number) {
    const transaction = await this.transRepo.findOneBy({ id });

    if (!transaction) throw new BadRequestException('Not found!');

    return transaction;
  }

  async findAllForBusiness(businessId?: number) {
    if (!businessId) throw new BadRequestException("Can't find business id");

    const transactions = await this.transRepo.find({
      where: {
        to: TransactionTo.business,
        order: { businessId },
      },
    });

    return transactions;
  }
}
