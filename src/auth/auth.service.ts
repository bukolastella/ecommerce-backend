import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDto,
  SendVerifyEmailDto,
  SignUpDto,
  VerifyEmailDto,
} from './dto/signup.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { generateSecureSixDigitCode, hashString } from 'src/utils/data';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
    private jwtService: JwtService,
  ) {}

  private sendVerifyEmail = async (dto: SendVerifyEmailDto) => {
    const { email } = dto;

    const user = await this.usersRepo.findOneBy({ email });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isEmailVerfied)
      throw new BadRequestException('Email already verified');

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

  signUp = async (signUpDto: SignUpDto) => {
    const { confirmPassword, ...rest } = signUpDto;

    if (rest.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = this.usersRepo.create({
      ...rest,
    });

    try {
      await this.usersRepo.save(user);

      await this.sendVerifyEmail({ email: signUpDto.email });

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

  resendVerifyEmail = async (dto: SendVerifyEmailDto) => {
    await this.sendVerifyEmail(dto);
    return { message: 'Email sent successfully!' };
  };

  login = async (dto: LoginDto) => {
    const { email, password } = dto;
    const user = await this.usersRepo.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Incorrect email or password!');
    }

    if (!user.isEmailVerfied) {
      await this.sendVerifyEmail({ email: dto.email });
      throw new BadRequestException(
        'Email not verified! Check email for token sent.',
      );
    }

    const token = await this.jwtService.signAsync({ sub: user.id });

    return {
      token,
      user,
    };
  };
}
