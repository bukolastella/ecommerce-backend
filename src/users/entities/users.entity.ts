import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserRole } from 'src/admin/admins/dto/admins.dto';

export enum UserType {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

export enum AuthProvider {
  local = 'local',
  google = 'google',
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
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
  @Column({ nullable: true, type: 'text' })
  password: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  emailVerificationHash: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpiresAt: Date | null;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  forgotPasswordHash: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'timestamp' })
  forgotPasswordExpiresAt: Date | null;

  @Exclude()
  @Column({ nullable: true, type: 'timestamp' })
  passwordChangedAt: Date | null;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'boolean', default: false })
  businessVerfied: boolean;

  @Column({ nullable: true, type: 'text' })
  role: UserRole | null;

  @Exclude()
  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.local })
  provider: AuthProvider;

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password && !this.password.startsWith('$2b$12$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password && !this.password.startsWith('$2b$12$')) {
      this.passwordChangedAt = new Date();
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  hasPasswordChangedAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        this.passwordChangedAt.getTime() / 1000,
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }
}
