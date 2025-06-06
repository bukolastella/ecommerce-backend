import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Length(6, 6, { message: 'Token must be exactly 6 characters' })
  token: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class SendVerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Length(6, 6, { message: 'Token must be exactly 6 characters' })
  token: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  newPassword: string;

  @ApiProperty()
  @IsString()
  confirmNewPassword: string;
}

export class BusinessSignUpDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;

  @ApiProperty({ required: false, format: 'binary', type: 'string' })
  logo?: File;

  @ApiProperty()
  @IsString()
  businessAddress: string;
}
