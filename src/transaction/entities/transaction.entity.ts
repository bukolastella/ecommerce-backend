import { Transform } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum TransactionType {
  add = 'add',
  withdrawal = 'withdrawal',
}

export enum TransactionTo {
  admin = 'admin',
  business = 'business',
}

export enum TransactionFrom {
  order = 'order',

  //   withdrawal
  system = 'system',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.transaction, {
    eager: true,
  })
  @Transform(({ value }) => (value as Order)?.id)
  order?: Order;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionTo })
  to: TransactionTo;

  @Column({ type: 'enum', enum: TransactionFrom })
  from: TransactionFrom;

  @Column({
    type: 'decimal',
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ nullable: true })
  percentShare?: string;

  @Column({ nullable: true })
  identityId?: number;
}
