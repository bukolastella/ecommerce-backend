import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from 'src/auth/dto/auth.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('admin')
export class AdminController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
