import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BusinessSignUpDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SendVerifyEmailDto,
  SignUpDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Users, UserType } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { generateSecureSixDigitCode, hashString } from 'src/utils/data';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UploadService } from 'src/upload/upload.service';

interface PostgreSQLError {
  code: string;
  detail?: string;
  message: string;
  constraint?: string;
}

enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  FORGOT_PASSWORD = 'forgot_password',
}

interface TokenFields {
  hashField: keyof Users;
  expiresAtField: keyof Users;
  emailTemplate: string;
  emailSubject: string;
}

@Injectable()
export class AuthService {
  private readonly TOKEN_EXPIRY_MINUTES = 10;

  private readonly tokenConfig: Record<TokenType, TokenFields> = {
    [TokenType.EMAIL_VERIFICATION]: {
      hashField: 'emailVerificationHash',
      expiresAtField: 'emailVerificationExpiresAt',
      emailTemplate: 'email-verification',
      emailSubject: 'Verify Your Email',
    },
    [TokenType.FORGOT_PASSWORD]: {
      hashField: 'forgotPasswordHash',
      expiresAtField: 'forgotPasswordExpiresAt',
      emailTemplate: 'forgot-password',
      emailSubject: 'Forgot Password',
    },
  };

  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
    private jwtService: JwtService,
  ) {}

  private async generateAndStoreToken(
    user: Users,
    tokenType: TokenType,
  ): Promise<string> {
    const token = generateSecureSixDigitCode();
    const tokenHash = hashString(token);
    const expiresAt = new Date(
      Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    const config = this.tokenConfig[tokenType];

    const updatedUser = {
      ...user,
      [config.hashField]: tokenHash,
      [config.expiresAtField]: expiresAt,
    };

    await this.usersRepo.save(updatedUser);
    return token;
  }

  private verifyToken(user: Users, token: string, tokenType: TokenType) {
    const config = this.tokenConfig[tokenType];
    const expiresAt = user[config.expiresAtField] as Date | null;
    const storedHash = user[config.hashField] as string | null;

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Token has expired');
    }

    const incomingHash = hashString(token);
    if (incomingHash !== storedHash) {
      throw new BadRequestException('Invalid token');
    }
  }

  private async clearTokenFields(
    user: Users,
    tokenType: TokenType,
  ): Promise<void> {
    const config = this.tokenConfig[tokenType];

    const updatedUser = this.usersRepo.create({
      ...user,
      [config.hashField]: null,
      [config.expiresAtField]: null,
    });

    await this.usersRepo.save(updatedUser);
  }

  private async sendTokenEmail(
    user: Users,
    token: string,
    tokenType: TokenType,
  ): Promise<void> {
    const config = this.tokenConfig[tokenType];

    await this.mailService.sendMail({
      to: user.email,
      subject: config.emailSubject,
      template: config.emailTemplate,
      context: {
        name: user.name,
        token,
      },
    });
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const dbError = error.driverError as PostgreSQLError;

      if (dbError.code === '23505') {
        if (dbError.detail?.includes('email')) {
          throw new BadRequestException('Email already exists');
        }
        throw new BadRequestException('Resource already exists');
      }
    }
    throw error;
  }

  private async findUserByEmail(email: string): Promise<Users> {
    const user = await this.usersRepo.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private sendVerifyEmail = async (dto: SendVerifyEmailDto) => {
    const { email } = dto;
    const user = await this.findUserByEmail(email);

    if (user.isEmailVerfied) {
      throw new BadRequestException('Email already verified');
    }

    const token = await this.generateAndStoreToken(
      user,
      TokenType.EMAIL_VERIFICATION,
    );
    await this.sendTokenEmail(user, token, TokenType.EMAIL_VERIFICATION);
    return user;
  };

  signUp = async (signUpDto: SignUpDto) => {
    const { confirmPassword, ...rest } = signUpDto;

    if (rest.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = this.usersRepo.create({ ...rest });

    try {
      await this.usersRepo.save(user);
      await this.sendVerifyEmail({ email: signUpDto.email });
      return user;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  };

  verifyEmail = async (dto: VerifyEmailDto) => {
    const { email, token } = dto;
    const user = await this.findUserByEmail(email);

    this.verifyToken(user, token, TokenType.EMAIL_VERIFICATION);

    user.isEmailVerfied = true;
    await this.clearTokenFields(user, TokenType.EMAIL_VERIFICATION);

    return { message: 'Email successfully verified' };
  };

  resendVerifyEmail = async (dto: SendVerifyEmailDto) => {
    await this.sendVerifyEmail(dto);
    return { message: 'Email sent successfully!' };
  };

  login = async (dto: LoginDto) => {
    const { email, password } = dto;

    try {
      const user = await this.findUserByEmail(email);

      if (!(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Incorrect email or password!');
      }

      if (!user.isEmailVerfied) {
        await this.sendVerifyEmail({ email: dto.email });
        throw new BadRequestException(
          'Email not verified! Check email for token sent.',
        );
      }

      if (user.type === UserType.STORE && !user.businessVerfied) {
        throw new BadRequestException(
          'Business not verified yet. Contact support for more info.',
        );
      }

      const token = await this.jwtService.signAsync({ sub: user.id });

      return { token, user };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Incorrect email or password!');
      }
      throw error;
    }
  };

  forgotPassword = async (dto: ForgotPasswordDto) => {
    const { email } = dto;
    const user = await this.findUserByEmail(email);

    const token = await this.generateAndStoreToken(
      user,
      TokenType.FORGOT_PASSWORD,
    );
    await this.sendTokenEmail(user, token, TokenType.FORGOT_PASSWORD);

    return { message: 'Token sent successfully' };
  };

  resetPassword = async (dto: ResetPasswordDto) => {
    const { email, token, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.findUserByEmail(email);
    this.verifyToken(user, token, TokenType.FORGOT_PASSWORD);

    user.password = password;
    await this.clearTokenFields(user, TokenType.FORGOT_PASSWORD);

    return { message: 'Password reset successfully' };
  };

  changePassword = (dto: ChangePasswordDto) => {
    const { password, newPassword, confirmNewPassword } = dto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (password === newPassword) {
      throw new BadRequestException(
        "New password can't be the same as old password",
      );
    }

    return { message: 'Password changes successfully' };
  };

  businessSignUp = async (
    dto: BusinessSignUpDto,
    logo: Express.Multer.File,
  ) => {
    const { confirmPassword, ...rest } = dto;

    if (rest.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let user: Users;

    if (logo) {
      const resultFile = await this.uploadService.uploadImage(logo);
      user = this.usersRepo.create({ ...rest, avatar: resultFile });
    }

    user = this.usersRepo.create({ ...rest });

    try {
      await this.usersRepo.save(user);
      await this.sendVerifyEmail({ email: dto.email });
      return user;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  };
}
