import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto, VerifyEmailDto } from './dto/signup.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { generateSecureSixDigitCode, hashString } from 'src/utils/data';

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
      const emailVerificationToken = generateSecureSixDigitCode();

      const emailVerificationHash = hashString(emailVerificationToken);

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

  verifyEmail = async (dto: VerifyEmailDto) => {
    const { email, token } = dto;

    const user = await this.usersRepo.findOneBy({ email });

    if (!user) throw new NotFoundException('User not found');

    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token has expired');
    }

    const incomingHash = hashString(token);
    if (incomingHash !== user.emailVerificationHash) {
      throw new BadRequestException('Invalid token');
    }

    user.isEmailVerfied = true;
    user.emailVerificationHash = null;
    user.emailVerificationExpiresAt = null;

    await this.usersRepo.save(user);

    return { message: 'Email successfully verified' };
  };
}
