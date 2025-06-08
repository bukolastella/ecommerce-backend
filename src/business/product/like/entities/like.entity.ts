import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ProductLike {
  @PrimaryGeneratedColumn()
  id: number;

  //   @Column()
  //   productId: number;
  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'CASCADE',
  })
  product: Product;

  @Exclude()
  @Column()
  userId: number;
}
