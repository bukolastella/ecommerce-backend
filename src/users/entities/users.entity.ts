import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  emailVerificationHash: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpiresAt: Date | null;
}
