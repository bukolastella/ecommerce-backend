import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum UserType {
  USER = 'user',
  STORE = 'store',
  ADMIN = 'admin',
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({
    type: 'enum',
    default: UserType.USER,
    enum: UserType,
  })
  type: UserType;

  @Column({ type: 'boolean', default: false })
  isEmailVerfied: boolean;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  emailVerificationHash: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpiresAt: Date | null;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
