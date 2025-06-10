import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/profile/profile.controller';
import { JwtService } from '@nestjs/jwt';
import { IMAGE_UPLOAD_PIPE } from 'src/upload/fileValidators';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verify-email')
  resendVerifyEmail(@Body() dto: SendVerifyEmailDto) {
    return this.authService.resendVerifyEmail(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('business/signup')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  businessSignUp(
    @Body() dto: BusinessSignUpDto,
    @UploadedFile(IMAGE_UPLOAD_PIPE)
    file: Express.Multer.File,
  ) {
    return this.authService.businessSignUp(dto, file);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates Google OAuth2 login flow
    // (never called because Passport redirects automatically)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: RequestWithUser) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('No user not found');
    }

    const token = await this.jwtService.signAsync({ sub: user.id });

    return {
      token,
      user,
    };
  }
}
