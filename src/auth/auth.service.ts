import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
  ) {}

  signUp = async (signUpDto: SignUpDto) => {
    //confirm if password matches

    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = this.usersRepo.create(signUpDto);

    try {
      //confirm if user doesn't exit before
      //save user, set isEmailVerfied to false and send email otp
      return await this.usersRepo.save(user);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as PostgreSQLError;

        if (dbError.code === '23505') {
          // Check which field caused the duplicate error
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
