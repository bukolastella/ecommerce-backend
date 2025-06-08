import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  categoryId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', array: true })
  images: string[];

  // @Column({ type: 'int' })
  // businessId: number;

  @ManyToOne(() => Users, {
    eager: true,
    onDelete: 'CASCADE',
  })
  // @JoinColumn({ name: 'businessId' })
  business: Users;
}
