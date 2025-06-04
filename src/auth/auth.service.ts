import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';

interface PostgreSQLError {
  code: string;
  detail?: string;
  message: string;
  constraint?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private readonly mailService: MailService,
  ) {}

  signUp = async (signUpDto: SignUpDto) => {
    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = this.usersRepo.create(signUpDto);

    try {
      function generateSecureSixDigitCode(): string {
        const buffer = crypto.randomBytes(4); // 4 bytes ~ 32 bits
        const num = buffer.readUInt32BE(0) % 1000000; // modulo to get 6 digits
        return num.toString().padStart(6, '0');
      }

      const emailVerificationToken = generateSecureSixDigitCode();

      const emailVerificationHash = crypto
        .createHash('sha256')
        .update(emailVerificationToken)
        .digest('hex');

      const emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.usersRepo.save({
        ...user,
        emailVerificationHash,
        emailVerificationExpiresAt,
      });

      await this.mailService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        template: 'email-verification',
        context: {
          name: user.name,
          token: emailVerificationToken,
        },
      });

      return user;
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as PostgreSQLError;

        if (dbError.code === '23505') {
          if (dbError.detail?.includes('email')) {
            throw new BadRequestException('Email already exists');
          }

          // Generic unique constraint error
          throw new BadRequestException('Resource already exists');
        }
      }

      throw error;
    }
  };
}
