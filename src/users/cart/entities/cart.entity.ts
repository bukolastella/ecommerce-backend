import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Product } from 'src/business/product/entities/product.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'CASCADE',
  })
  product: Product;

  @Exclude()
  @Column()
  userId: number;
}
