import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column()
  productSlug: string;

  @Column()
  categoryId: number;

  @Column({ type: 'text', array: true })
  images: string[];

  @Column()
  quantity: number;

  @Column()
  currency: string;

  @Column({
    type: 'decimal',
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Exclude()
  @Column()
  cartId: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;
}
