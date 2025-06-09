import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OrderItem } from './orderItem.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

export enum OrderStatus {
  pending = 'pending', // as been paid for
  readyToBePicked = 'readyToBePicked',
  picked = 'picked', // the end.
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  userId: number;

  // @Exclude()
  @Column({ nullable: true })
  businessId: number;

  @Column()
  currency: string;

  @Column({ type: 'decimal', scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  orderItems: OrderItem[];

  @OneToMany(() => Transaction, (transaction) => transaction.order, {
    cascade: true,
  })
  transaction: Transaction[];
}
