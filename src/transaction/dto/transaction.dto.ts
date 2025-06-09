import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TransactionTo, TransactionType } from '../entities/transaction.entity';
import { Type } from 'class-transformer';

export class FilterTransactionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  businessId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  orderId?: number;

  @ApiProperty({ required: false, enum: TransactionTo })
  @IsOptional()
  @IsEnum(TransactionTo)
  to?: TransactionTo;

  @ApiProperty({ required: false, enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}

export class WithdrawalTransactionDto {
  @ApiProperty({ enum: TransactionTo })
  @IsEnum(TransactionTo)
  to: TransactionTo;

  // @ApiProperty({ enum: TransactionFrom })
  // @IsEnum(TransactionFrom)
  // from: TransactionFrom;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  identityId: number;
}
